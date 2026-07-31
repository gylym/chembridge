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
    if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
    else if (/^\/(?:shorts|embed)\//.test(url.pathname)) id = url.pathname.split("/")[2] ?? "";
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
