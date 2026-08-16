import type { NextRequest } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { writeAudit } from "../../../../server/audit";
import { requireRole } from "../../../../server/auth";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";
import { passwordSchema } from "../../../../server/auth-validation";

const updateInput = z.object({
  userId: z.string().min(1).max(200),
  role: z.enum(["student", "school_student", "university_student", "teacher", "content_admin", "admin"]).optional(),
  status: z.enum(["active", "suspended", "deleted"]).optional(),
  name: z.string().trim().min(2).max(100).optional(),
  level: z.enum(["7-сынып", "8-сынып", "9-сынып", "10-сынып", "11-сынып", "Студент"]).optional(),
  revokeSessions: z.boolean().optional(),
  temporaryPassword: passwordSchema.optional(),
}).refine((value) => Object.keys(value).length > 1, "Өзгеріс көрсетілмеді");

async function activeAdminCount() {
  const db = getD1();
  const row = await db.prepare(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND status = 'active' AND deleted_at IS NULL",
  ).first<{ count: number }>();
  return Number(row?.count ?? 0);
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const db = getD1();
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") ?? "").slice(0, 100);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0);
    const roleFilter = ["student", "school_student", "university_student", "teacher", "content_admin", "admin"].includes(role ?? "") ? role : null;
    const statusFilter = ["active", "suspended", "deleted"].includes(status ?? "") ? status : null;
    const rows = await db.prepare(
      `SELECT id, username, email, name, role, status, level, xp,
              created_at AS createdAt, last_login_at AS lastLoginAt
       FROM users
       WHERE (name LIKE ? OR username LIKE ? OR email LIKE ?)
         AND (? IS NULL OR role = ?)
         AND (? IS NULL OR status = ?)
       ORDER BY created_at DESC LIMIT 25 OFFSET ?`,
    ).bind(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      roleFilter,
      roleFilter,
      statusFilter,
      statusFilter,
      offset,
    ).all();
    const stats = await db.prepare(
      `SELECT COUNT(*) AS total,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS students,
       SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) AS teachers,
       SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins
       FROM users`,
    ).first();
    return apiSuccess({
      items: rows.results,
      stats,
      nextOffset: rows.results.length === 25 ? offset + 25 : null,
    });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "admin-user-update", 30);
    const actor = await requireRole(request, ["admin"]);
    const parsed = updateInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Қолданушы деректері дұрыс емес");
    }

    const db = getD1();
    const target = await db.prepare(
      "SELECT id, role, status FROM users WHERE id = ? AND deleted_at IS NULL",
    ).bind(parsed.data.userId).first<{ id: string; role: string; status: string }>();
    if (!target) throw new ApiError(404, "NOT_FOUND", "Қолданушы табылмады");

    const removesActiveAdmin =
      target.role === "admin"
      && target.status === "active"
      && (parsed.data.role && parsed.data.role !== "admin"
        || parsed.data.status && parsed.data.status !== "active");
    if (removesActiveAdmin && await activeAdminCount() <= 1) {
      throw new ApiError(409, "LAST_ADMIN_GUARD", "Жүйеде кемінде бір белсенді әкімші қалуы керек");
    }
    if (parsed.data.userId === actor.id && removesActiveAdmin) {
      throw new ApiError(409, "SELF_ADMIN_GUARD", "Өз әкімші аккаунтыңызды бұлай өзгерте алмайсыз");
    }

    const assignments: string[] = [];
    const values: unknown[] = [];
    for (const [field, column] of [
      ["role", "role"],
      ["status", "status"],
      ["name", "name"],
      ["level", "level"],
    ] as const) {
      const value = parsed.data[field];
      if (value !== undefined) {
        assignments.push(`${column} = ?`);
        values.push(value);
      }
    }
    if (parsed.data.status === "deleted") assignments.push("deleted_at = unixepoch()");
    if (parsed.data.status === "active") assignments.push("deleted_at = NULL");
    if (parsed.data.temporaryPassword) {
      assignments.push("password_hash = ?");
      values.push(await hash(parsed.data.temporaryPassword, 11));
    }
    assignments.push("updated_at = unixepoch()");

    await db.prepare(`UPDATE users SET ${assignments.join(", ")} WHERE id = ?`)
      .bind(...values, parsed.data.userId).run();
    if (parsed.data.revokeSessions || parsed.data.temporaryPassword || parsed.data.status && parsed.data.status !== "active") {
      await db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").bind(parsed.data.userId).run();
    }
    const safeAuditData = { ...parsed.data };
    delete safeAuditData.temporaryPassword;
    await writeAudit(actor, "USER_UPDATE", "user", parsed.data.userId, safeAuditData);
    return apiSuccess(safeAuditData);
  } catch (error) {
    return apiFailure(error);
  }
}
