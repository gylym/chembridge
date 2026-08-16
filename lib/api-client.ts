export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fields?: Record<string, string | string[]> } };

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code = "REQUEST_FAILED",
    public status = 0,
    public fields: Record<string, string | string[]> = {},
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const REMOTE_API_ORIGIN = "https://chembridge-kz-learning.chatgpt-edu-3017.chatgpt.site";
const TOKEN_KEY = "chembridge_api_token";
let activeApiToken: string | null = null;

function usesRemoteApi() {
  return typeof window !== "undefined" && window.location.hostname === "gylym.github.io";
}

function readToken() {
  if (typeof window === "undefined" || !usesRemoteApi()) return null;
  // Never keep a cross-origin bearer token in persistent storage. Remove the
  // legacy value during migration and scope the token to the current tab.
  window.localStorage.removeItem(TOKEN_KEY);
  return activeApiToken ?? window.sessionStorage.getItem(TOKEN_KEY);
}

export function saveApiToken(token: string) {
  if (typeof window === "undefined") return;
  activeApiToken = token;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  // The production Site uses a secure HttpOnly cookie. A browser-readable
  // bearer token is needed only by the static GitHub Pages frontend.
  if (!usesRemoteApi()) return;
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearApiToken() {
  if (typeof window === "undefined") return;
  activeApiToken = null;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
}

export function appPath(path: string) {
  if (typeof window === "undefined" || window.location.hostname !== "gylym.github.io") return path;
  return `/chembridge${path === "/" ? "/" : path}`;
}

export function apiUrl(path: string) {
  return usesRemoteApi() && path.startsWith("/") ? `${REMOTE_API_ORIGIN}${path}` : path;
}

function absolutizeApiUrls(value: unknown): unknown {
  if (!usesRemoteApi()) return value;
  if (typeof value === "string") return value.startsWith("/api/") || value.startsWith("/sample-files/") ? `${REMOTE_API_ORIGIN}${value}` : value;
  if (Array.isArray(value)) return value.map(absolutizeApiUrls);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, absolutizeApiUrls(item)]));
  }
  return value;
}

export async function apiFetch(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const token = readToken();
  const isAuthEntryPoint = url === "/api/auth/login" || url === "/api/auth/register";
  // A stale session must never turn a cross-origin login into an authenticated
  // preflight. Login and registration establish a fresh session themselves.
  if (token && !isAuthEntryPoint) headers.set("authorization", `Bearer ${token}`);
  return fetch(apiUrl(url), {
    cache: "no-store",
    ...init,
    headers,
    // Remote credential sessions use a short-lived bearer token and a secure
    // partitioned HttpOnly cookie as a browser-compatible fallback.
    credentials: usesRemoteApi() ? "include" : "same-origin",
  });
}

async function readApiEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    const detail = text.trim();
    const message = response.status === 401
      ? "Сессия аяқталды. Аккаунтқа қайта кіріңіз."
      : response.status === 403
        ? "Бұл әрекетке рұқсатыңыз жоқ. Аккаунт құқығын тексеріңіз."
        : response.status === 413
          ? "Файл көлемі рұқсат етілген шектен үлкен."
          : response.status >= 500
            ? "Серверде уақытша қате пайда болды. Әрекетті қайталап көріңіз."
            : detail && detail.length <= 180
              ? `Сервер жауабы: ${detail}`
              : `Сұрау орындалмады (${response.status}).`;
    throw new ApiClientError(message, "INVALID_SERVER_RESPONSE", response.status);
  }
}

function inferredContentType(file: File) {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return ({
    pdf: "application/pdf",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  } as Record<string, string>)[extension ?? ""] ?? "application/octet-stream";
}

export async function uploadMediaFile(
  file: File,
  metadata: { title: string; altText: string; folder: string },
) {
  if (file.size === 0) throw new ApiClientError("Файл бос немесе оқылмайды.", "EMPTY_FILE");
  if (file.size > 15 * 1024 * 1024) throw new ApiClientError("Файл көлемі 15 МБ-тан аспауы керек.", "MEDIA_TOO_LARGE", 413);
  const normalizedFile = file.type ? file : new File([file], file.name, { type: inferredContentType(file) });
  const body = new FormData();
  body.set("file", normalizedFile);
  body.set("title", metadata.title);
  body.set("altText", metadata.altText);
  body.set("folder", metadata.folder);
  return apiRequest<{ id: string; url: string }>("/api/admin/media-upload", {
    method: "POST",
    body,
  });
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && init?.body !== undefined) {
    const isRemoteAuthEntryPoint = usesRemoteApi()
      && (url === "/api/auth/login" || url === "/api/auth/register");
    // text/plain is CORS-safelisted, while the body remains valid JSON and is
    // still parsed with request.json() by the API. This keeps authentication
    // working even when an edge strips headers from an OPTIONS response.
    headers.set("content-type", isRemoteAuthEntryPoint
      ? "text/plain;charset=UTF-8"
      : "application/json");
  }
  let response: Response;
  try {
    response = await apiFetch(url, { ...init, headers });
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError("Сервермен байланысу мүмкін болмады. Интернет байланысын тексеріп, қайталап көріңіз.", "NETWORK_ERROR");
  }
  const payload = await readApiEnvelope<T>(response);
  if (!response.ok || !payload.ok) {
    if (payload.ok) throw new ApiClientError("Сұрау орындалмады", "REQUEST_FAILED", response.status);
    throw new ApiClientError(payload.error.message, payload.error.code, response.status, payload.error.fields ?? {});
  }
  return absolutizeApiUrls(payload.data) as T;
}
