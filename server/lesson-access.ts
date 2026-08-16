import type { Actor } from "./auth";
import { getD1 } from "./database";
import { ApiError } from "./http";

export async function requireLessonEditAccess(actor: Actor, lessonId: string) {
  if (actor.role === "admin" || actor.role === "content_admin") return;
  if (actor.role !== "teacher") {
    throw new ApiError(403, "FORBIDDEN", "Бұл сабақты өзгертуге рұқсатыңыз жоқ");
  }
  const teacherCourseId = `course:teacher:${actor.id}`;
  const owned = await getD1().prepare(
    `SELECT l.id
     FROM lessons l
     JOIN modules m ON m.id = l.module_id
     JOIN courses c ON c.id = m.course_id
     WHERE l.id = ? AND l.deleted_at IS NULL
       AND (
         (c.author_id = ? AND c.id = ?)
         OR EXISTS (
           SELECT 1 FROM audit_logs a
           WHERE a.actor_id = ? AND a.entity_id = l.id
             AND a.entity_type IN ('lesson', 'lessons')
             AND a.action IN ('CREATE', 'CONTENT_CREATE')
         )
       )`,
  ).bind(lessonId, actor.id, teacherCourseId, actor.id).first();
  if (!owned) {
    throw new ApiError(403, "LESSON_SCOPE_FORBIDDEN", "Тек өзіңіз жасаған сабақты өзгерте аласыз");
  }
}
