import type { NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "../../../../server/audit";
import { requirePermission } from "../../../../server/auth";
import { sanitizeCmsText } from "../../../../server/cms";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "manage_site");
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? "all";
    const search = (url.searchParams.get("search") ?? "").slice(0, 100);
    const db = getD1();
    const rows = await db.prepare(
      `SELECT f.id, f.category, f.subject, f.message, f.related_page AS relatedPage,
              f.status, f.internal_note AS internalNote, f.created_at AS createdAt,
              u.name AS userName, u.username, u.email
       FROM feedback_messages f JOIN users u ON u.id = f.user_id
       WHERE f.deleted_at IS NULL AND (? = 'all' OR f.status = ?)
         AND (f.subject LIKE ? OR f.message LIKE ? OR u.name LIKE ?)
       ORDER BY CASE f.status WHEN 'new' THEN 0 WHEN 'read' THEN 1 ELSE 2 END, f.created_at DESC
       LIMIT 100`,
    ).bind(status, status, `%${search}%`, `%${search}%`, `%${search}%`).all();
    return apiSuccess({ items: rows.results });
  } catch (error) { return apiFailure(error); }
}

const updateInput = z.object({
  id: z.string().min(1).max(200),
  status: z.enum(["new", "read", "resolved"]),
  internalNote: z.string().trim().max(5_000).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "admin-feedback", 60);
    const actor = await requirePermission(request, "manage_site");
    const parsed = updateInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Кері байланыс күйі дұрыс емес");
    const db = getD1();
    const result = await db.prepare(
      `UPDATE feedback_messages SET status = ?, internal_note = ?, resolved_by = ?,
       resolved_at = CASE WHEN ? = 'resolved' THEN unixepoch() ELSE NULL END, updated_at = unixepoch()
       WHERE id = ? AND deleted_at IS NULL`,
    ).bind(parsed.data.status, parsed.data.internalNote ? sanitizeCmsText(parsed.data.internalNote) : null, parsed.data.status === "resolved" ? actor.id : null, parsed.data.status, parsed.data.id).run();
    if (!result.meta.changes) throw new ApiError(404, "NOT_FOUND", "Хабарлама табылмады");
    await writeAudit(actor, "FEEDBACK_UPDATE", "feedback", parsed.data.id, { status: parsed.data.status });
    return apiSuccess({ id: parsed.data.id, status: parsed.data.status });
  } catch (error) { return apiFailure(error); }
}
