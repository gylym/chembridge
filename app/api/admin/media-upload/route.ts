import type { NextRequest } from "next/server";
import { writeAudit } from "../../../../server/audit";
import { requirePermission } from "../../../../server/auth";
import { getD1, getMediaBucket } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf"]);

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "media-upload", 20);
    const actor = await requirePermission(request, "edit_content");
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();
    const altText = String(form.get("altText") ?? "").trim();
    const folder = String(form.get("folder") ?? "general").trim().replace(/[^a-z0-9_-]/gi, "-").slice(0, 60);
    if (!(file instanceof File) || !title || !altText) {
      throw new ApiError(400, "VALIDATION_ERROR", "Файл, атауы және alt мәтіні міндетті");
    }
    if (!allowedTypes.has(file.type)) throw new ApiError(400, "UNSUPPORTED_MEDIA", "Бұл файл түріне рұқсат жоқ");
    if (file.size > 8 * 1024 * 1024) throw new ApiError(413, "MEDIA_TOO_LARGE", "Файл көлемі 8 МБ-тан аспауы керек");
    const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "bin";
    if (file.type === "application/pdf" && extension.toLowerCase() !== "pdf") {
      throw new ApiError(400, "INVALID_PDF", "PDF файлының кеңейтімі .pdf болуы керек");
    }
    const key = `${folder || "general"}/${crypto.randomUUID()}.${extension}`;
    await getMediaBucket().put(key, file.stream(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { originalName: file.name.slice(0, 200), uploadedBy: actor.id },
    });
    const id = `media:${crypto.randomUUID()}`;
    const url = `/api/media/${encodeURIComponent(key)}`;
    await getD1().prepare(
      `INSERT INTO media_assets
       (id, title, url, mime_type, alt_text, folder, size_bytes, uploaded_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    ).bind(id, title.slice(0, 200), url, file.type, altText.slice(0, 300), folder || "general", file.size, actor.id).run();
    await writeAudit(actor, "MEDIA_UPLOAD", "media", id, { key, type: file.type, size: file.size });
    return apiSuccess({ id, url }, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
