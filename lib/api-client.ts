export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

const REMOTE_API_ORIGIN = "https://chembridge-kz-learning.chatgpt-edu-3017.chatgpt.site";
const TOKEN_KEY = "chembridge_api_token";

function usesRemoteApi() {
  return typeof window !== "undefined" && window.location.hostname === "gylym.github.io";
}

function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
}

export function saveApiToken(token: string, persistent: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  (persistent ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearApiToken() {
  if (typeof window === "undefined") return;
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
  if (token) headers.set("authorization", `Bearer ${token}`);
  return fetch(apiUrl(url), {
    cache: "no-store",
    ...init,
    headers,
    credentials: usesRemoteApi() ? "omit" : "same-origin",
  });
}

async function readApiEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    const detail = text.trim();
    throw new Error(
      detail
        ? `Сервер сұрауды қабылдамады (${response.status}): ${detail}`
        : `Сервер сұрауды қабылдамады (${response.status})`,
    );
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

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

export async function uploadMediaFile(
  file: File,
  metadata: { title: string; altText: string; folder: string },
) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return apiRequest<{ id: string; url: string }>("/api/admin/media-upload", {
    method: "POST",
    body: JSON.stringify({
      ...metadata,
      fileName: file.name,
      contentType: inferredContentType(file),
      base64: bytesToBase64(bytes),
    }),
  });
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) headers.set("content-type", "application/json");
  const response = await apiFetch(url, { ...init, headers });
  const payload = await readApiEnvelope<T>(response);
  if (!response.ok || !payload.ok) {
    throw new Error(payload.ok ? "Сұрау орындалмады" : payload.error.message);
  }
  return absolutizeApiUrls(payload.data) as T;
}
