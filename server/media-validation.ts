import { ApiError } from "./http";

export function extractYouTubeVideoId(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ApiError(400, "INVALID_YOUTUBE_URL", "YouTube сілтемесі дұрыс емес");
  }
  if (url.protocol !== "https:") {
    throw new ApiError(400, "INVALID_YOUTUBE_URL", "YouTube сілтемесі HTTPS болуы керек");
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  let id = "";
  if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? "";
  if (["youtube.com", "m.youtube.com"].includes(host)) {
    const pathname = url.pathname.toLowerCase();
    const videoParam = Array.from(url.searchParams.entries()).find(([key]) => key.toLowerCase() === "v")?.[1] ?? "";
    if (pathname === "/watch") id = videoParam;
    else if (/^\/(?:shorts|embed)\//.test(pathname)) id = url.pathname.split("/")[2] ?? "";
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
    throw new ApiError(400, "INVALID_YOUTUBE_URL", "Қолдау көрсетілетін YouTube сілтемесін енгізіңіз");
  }
  return id;
}

export function assertSafePdfUrl(rawUrl: string) {
  if (/^\/api\/media\/[A-Za-z0-9%_.\/-]+$/.test(rawUrl)) return rawUrl;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ApiError(400, "INVALID_PDF_URL", "PDF сілтемесі дұрыс емес");
  }
  if (url.protocol !== "https:" || !url.pathname.toLowerCase().endsWith(".pdf")) {
    throw new ApiError(400, "INVALID_PDF_URL", "HTTPS арқылы ашылатын .pdf сілтемесін енгізіңіз");
  }
  return url.toString();
}

const resourceExtensions = new Set(["ppt", "pptx", "pdf", "doc", "docx"]);

export function assertSafeResourceUrl(rawUrl: string) {
  if (/^\/api\/media\/[A-Za-z0-9%_.\/-]+$/.test(rawUrl)) return rawUrl;
  if (/^\/sample-files\/[A-Za-z0-9%_.-]+\.(?:pptx?|pdf|docx?)$/i.test(rawUrl)) return rawUrl;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ApiError(400, "INVALID_RESOURCE_URL", "Файл сілтемесі дұрыс емес");
  }
  const extension = url.pathname.split(".").pop()?.toLowerCase() ?? "";
  if (url.protocol !== "https:" || !resourceExtensions.has(extension)) {
    throw new ApiError(400, "INVALID_RESOURCE_URL", "HTTPS арқылы ашылатын PPT, PPTX, PDF, DOC немесе DOCX файлын енгізіңіз");
  }
  return url.toString();
}
