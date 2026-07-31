import type { NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "../../../../../server/audit";
import { requireRole } from "../../../../../server/auth";
import { getD1 } from "../../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../../server/http";
import { enforceMutationSecurity } from "../../../../../server/security";

const updateInput = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  objective: z.string().trim().min(10).max(1000).optional(),
  status: z.enum(["draft", "published"]).optional(),
}).refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await enforceMutationSecurity(request, "teacher-lesson-update", 30);
    const actor = await requireRole(request, ["teacher", "admin"]);
    const { id } = await context.params;
    const parsed = updateInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Өзгерістер дұрыс емес");
    const db = getD1();
    const current = await db.prepare("SELECT title, objective, status FROM lessons WHERE id = ? AND deleted_at IS NULL")
      .bind(id).first<{ title: string; objective: string; status: string }>();
    if (!current) throw new ApiError(404, "NOT_FOUND", "Сабақ табылмады");
    const next = { ...current, ...parsed.data };
    await db.prepare(
      "UPDATE lessons SET title = ?, objective = ?, status = ?, updated_at = unixepoch() WHERE id = ?",
    ).bind(next.title, next.objective, next.status, id).run();
    await writeAudit(actor, "UPDATE", "lesson", id, parsed.data);
    return apiSuccess({ id, ...next });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await enforceMutationSecurity(request, "teacher-lesson-delete", 10);
    const actor = await requireRole(request, ["teacher", "admin"]);
    const { id } = await context.params;
    const db = getD1();
    const result = await db.prepare(
      "UPDATE lessons SET deleted_at = unixepoch(), updated_at = unixepoch() WHERE id = ? AND deleted_at IS NULL",
    ).bind(id).run();
    if (result.meta.changes === 0) throw new ApiError(404, "NOT_FOUND", "Сабақ табылмады");
    await writeAudit(actor, "SOFT_DELETE", "lesson", id);
    return apiSuccess({ id, deleted: true });
  } catch (error) {
    return apiFailure(error);
  }
}
