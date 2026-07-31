import type { NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "../../../../server/audit";
import { requireRole } from "../../../../server/auth";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";

const lessonInput = z.object({
  title: z.string().trim().min(3).max(160),
  objective: z.string().trim().min(10).max(1000),
  status: z.enum(["draft", "in_review", "published"]),
});

async function ensureDefaultModule(db: D1Database, actorId: string) {
  const existingModule = await db.prepare("SELECT id FROM modules WHERE deleted_at IS NULL ORDER BY position LIMIT 1")
    .first<{ id: string }>();
  if (existingModule) return existingModule.id;
  const courseId = "course:general-chemistry";
  const moduleId = "module:teacher-content";
  await db.batch([
    db.prepare(
      `INSERT OR IGNORE INTO courses
       (id, slug, title, description, status, author_id, created_at, updated_at)
       VALUES (?, 'general-chemistry', 'Жалпы химия', 'Мұғалім құрастырған курс', 'published', ?, unixepoch(), unixepoch())`,
    ).bind(courseId, actorId),
    db.prepare(
      `INSERT OR IGNORE INTO modules
       (id, course_id, title, position, created_at, updated_at)
       VALUES (?, ?, 'Негізгі модуль', 1, unixepoch(), unixepoch())`,
    ).bind(moduleId, courseId),
  ]);
  return moduleId;
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["teacher", "admin"]);
    const db = getD1();
    const rows = await db.prepare(
      `SELECT l.id, l.title, l.objective, l.status, l.position, m.title AS moduleTitle
       FROM lessons l JOIN modules m ON m.id = l.module_id
       WHERE l.deleted_at IS NULL ORDER BY l.updated_at DESC`,
    ).all();
    return apiSuccess(rows.results);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "teacher-lesson-create", 20);
    const actor = await requireRole(request, ["teacher", "admin"]);
    const parsed = lessonInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Сабақ деректері толық емес");
    const db = getD1();
    const moduleId = await ensureDefaultModule(db, actor.id);
    const positionRow = await db.prepare("SELECT COALESCE(MAX(position), 0) + 1 AS position FROM lessons WHERE module_id = ?")
      .bind(moduleId).first<{ position: number }>();
    const id = crypto.randomUUID();
    const slug = `${parsed.data.title.toLowerCase().replace(/[^a-z0-9а-яәіңғүұқөһ]+/gi, "-").replace(/^-|-$/g, "")}-${id.slice(0, 6)}`;
    const safeStatus = actor.role === "teacher" && parsed.data.status === "published" ? "in_review" : parsed.data.status;
    await db.prepare(
      `INSERT INTO lessons
       (id, module_id, slug, title, objective, status, position, xp_reward, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 50, unixepoch(), unixepoch())`,
    ).bind(id, moduleId, slug, parsed.data.title, parsed.data.objective, safeStatus, positionRow?.position ?? 1).run();
    await writeAudit(actor, "CREATE", "lesson", id, parsed.data);
    return apiSuccess({ id, ...parsed.data }, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
