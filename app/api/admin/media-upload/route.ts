import type { NextRequest } from "next/server";
import { writeAudit } from "../../../../server/audit";
import { requirePermission } from "../../../../server/auth";
import { getD1, getMediaBucket } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";

const allowedTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const requiredExtensions: Record<string, string[]> = {
  "application/pdf": ["pdf"],
  "application/vnd.ms-powerpoint": ["ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"],
  "application/msword": ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
};

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "media-upload", 20);
    const actor = await requirePermission(request, "publish_content");
    const requestType = request.headers.get("content-type") ?? "";
    let fileName = "";
    let contentType = "";
    let fileSize = 0;
    let fileBody: ReadableStream | ArrayBuffer;
    let title = "";
    let altText = "";
    let folder = "general";

    if (requestType.includes("application/json")) {
      const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
      fileName = typeof payload?.fileName === "string" ? payload.fileName : "";
      contentType = typeof payload?.contentType === "string" ? payload.contentType : "";
      title = typeof payload?.title === "string" ? payload.title.trim() : "";
      altText = typeof payload?.altText === "string" ? payload.altText.trim() : "";
      folder = typeof payload?.folder === "string" ? payload.folder : "general";
      const encoded = typeof payload?.base64 === "string" ? payload.base64 : "";
      let bytes: Uint8Array;
      try {
        bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
      } catch {
        throw new ApiError(400, "INVALID_MEDIA_DATA", "Файл дерегі дұрыс кодталмаған");
      }
      fileSize = bytes.byteLength;
      const buffer = new ArrayBuffer(fileSize);
      new Uint8Array(buffer).set(bytes);
      fileBody = buffer;
    } else {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        throw new ApiError(400, "VALIDATION_ERROR", "Файл, атауы және alt мәтіні міндетті");
      }
      fileName = file.name;
      contentType = file.type;
      fileSize = file.size;
      fileBody = file.stream();
      title = String(form.get("title") ?? "").trim();
      altText = String(form.get("altText") ?? "").trim();
      folder = String(form.get("folder") ?? "general");
    }

    folder = folder.trim().replace(/[^a-z0-9_-]/gi, "-").slice(0, 60);
    if (!fileName || !title || !altText || fileSize === 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "Файл, атауы және alt мәтіні міндетті");
    }
    if (!allowedTypes.has(contentType)) throw new ApiError(400, "UNSUPPORTED_MEDIA", "Бұл файл түріне рұқсат жоқ");
    if (fileSize > 15 * 1024 * 1024) throw new ApiError(413, "MEDIA_TOO_LARGE", "Файл көлемі 15 МБ-тан аспауы керек");
    const extension = fileName.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "bin";
    const expectedExtensions = requiredExtensions[contentType];
    if (expectedExtensions && !expectedExtensions.includes(extension.toLowerCase())) {
      throw new ApiError(400, "INVALID_FILE_EXTENSION", `Файл кеңейтімі .${expectedExtensions.join(" немесе .")} болуы керек`);
    }
    const key = `${folder || "general"}/${crypto.randomUUID()}.${extension}`;
    await getMediaBucket().put(key, fileBody, {
      httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { originalName: fileName.slice(0, 200), uploadedBy: actor.id },
    });
    const id = `media:${crypto.randomUUID()}`;
    const url = `/api/media/${encodeURIComponent(key)}`;
    await getD1().prepare(
      `INSERT INTO media_assets
       (id, title, url, mime_type, alt_text, folder, size_bytes, uploaded_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    ).bind(id, title.slice(0, 200), url, contentType, altText.slice(0, 300), folder || "general", fileSize, actor.id).run();
    await writeAudit(actor, "MEDIA_UPLOAD", "media", id, { key, type: contentType, size: fileSize });
    return apiSuccess({ id, url }, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
