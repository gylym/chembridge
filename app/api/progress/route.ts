import type { NextRequest } from "next/server";
import { z } from "zod";
import { calculateServerXp } from "../../../lib/chemistry";
import { curriculumLessons } from "../../../lib/data";
import { requireActor } from "../../../server/auth";
import { getD1 } from "../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../server/http";
import { enforceMutationSecurity } from "../../../server/security";
import { validateLessonCompletion, type StoredLessonQuestion } from "../../../server/quiz-validation";

const progressInput = z.object({
  lessonId: z.string().min(1).max(100),
  percent: z.number().int().min(0).max(100),
  answers: z.array(z.number().int().min(0).max(20)).max(20).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor(request);
    const db = getD1();
    const rows = await db
      .prepare(
        `SELECT lesson_id AS lessonId, percent, completed_at AS completedAt
         FROM lesson_progress
         WHERE user_id = ? AND deleted_at IS NULL
         ORDER BY updated_at DESC`,
      )
      .bind(actor.id)
      .all();
    return apiSuccess({ user: actor, progress: rows.results });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "progress", 60);
    const actor = await requireActor(request);
    const parsed = progressInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Прогресс деректері дұрыс емес");
    }

    const db = getD1();
    const { lessonId, percent } = parsed.data;
    const progressId = `${actor.id}:${lessonId}`;
    const completed = percent === 100;
    if (completed) {
      const lesson = curriculumLessons.find((item) => item.id === lessonId);
      const answers = parsed.data.answers ?? [];
      const selectedQuiz = await db.prepare(
        `SELECT qz.id
         FROM quizzes qz
         JOIN lessons l ON l.id = qz.lesson_id
         JOIN modules m ON m.id = l.module_id
         JOIN courses c ON c.id = m.course_id
         WHERE qz.lesson_id = ? AND qz.status = 'published' AND qz.deleted_at IS NULL
           AND l.status = 'published' AND l.deleted_at IS NULL
           AND m.deleted_at IS NULL AND c.status = 'published' AND c.deleted_at IS NULL
         ORDER BY qz.updated_at DESC, qz.id DESC LIMIT 1`,
      ).bind(lessonId).first<{ id: string }>();
      let storedQuestions: StoredLessonQuestion[] | null = null;
      if (selectedQuiz) {
        const rows = await db.prepare(
          `SELECT q.correct_answer AS correctAnswer, q.options
           FROM questions q
           WHERE q.quiz_id = ? AND q.deleted_at IS NULL
           ORDER BY q.position`,
        ).bind(selectedQuiz.id).all<StoredLessonQuestion>();
        storedQuestions = rows.results;
      }
      const validAnswers = validateLessonCompletion(
        storedQuestions,
        lesson?.quiz.map((question) => question.answer) ?? null,
        answers,
      );
      if (!validAnswers) {
        throw new ApiError(400, "LESSON_CHECK_REQUIRED", "Сабақты аяқтау үшін 3 сұраққа дұрыс жауап беріңіз");
      }
    }

    await db
      .prepare(
        `INSERT INTO lesson_progress
         (id, user_id, lesson_id, percent, completed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, CASE WHEN ? THEN unixepoch() ELSE NULL END, unixepoch(), unixepoch())
         ON CONFLICT(user_id, lesson_id) DO UPDATE SET
           percent = MAX(percent, excluded.percent),
           completed_at = CASE WHEN excluded.percent = 100 THEN unixepoch() ELSE completed_at END,
           updated_at = unixepoch()`,
      )
      .bind(progressId, actor.id, lessonId, percent, completed ? 1 : 0)
      .run();

    let awardedXp = 0;
    if (completed) {
      awardedXp = calculateServerXp("LESSON");
      const transaction = await db
        .prepare(
          `INSERT OR IGNORE INTO user_xp_transactions
           (id, user_id, amount, reason, reference_id, created_at)
           VALUES (?, ?, ?, 'LESSON', ?, unixepoch())`,
        )
        .bind(`${actor.id}:LESSON:${lessonId}`, actor.id, awardedXp, lessonId)
        .run();

      if (transaction.meta.changes > 0) {
        await db
          .prepare("UPDATE users SET xp = xp + ?, updated_at = unixepoch() WHERE id = ?")
          .bind(awardedXp, actor.id)
          .run();
      } else {
        awardedXp = 0;
      }
    }

    return apiSuccess({ lessonId, percent, awardedXp });
  } catch (error) {
    return apiFailure(error);
  }
}
