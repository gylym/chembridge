import { getD1 } from "../../../server/database";
import { apiFailure, apiSuccess } from "../../../server/http";

export async function GET() {
  try {
    const db = getD1();
    const [lessons, blocks, questions] = await Promise.all([
      db.prepare(
        `SELECT l.id, l.title, l.objective, l.xp_reward AS xpReward,
                m.title AS unit, c.title AS course
         FROM lessons l
         JOIN modules m ON m.id = l.module_id
         JOIN courses c ON c.id = m.course_id
         WHERE l.status = 'published'
           AND l.deleted_at IS NULL
           AND m.deleted_at IS NULL
           AND c.deleted_at IS NULL
         ORDER BY c.title, m.position, l.position`,
      ).all(),
      db.prepare(
        `SELECT lesson_id AS lessonId, type, content, position
         FROM lesson_content_blocks
         WHERE deleted_at IS NULL
         ORDER BY lesson_id, position`,
      ).all(),
      db.prepare(
        `SELECT qz.lesson_id AS lessonId, q.id, q.prompt,
                q.correct_answer AS correctAnswer, q.explanation, q.position
         FROM questions q
         JOIN quizzes qz ON qz.id = q.quiz_id
         WHERE q.deleted_at IS NULL
           AND qz.deleted_at IS NULL
           AND qz.status = 'published'
         ORDER BY qz.lesson_id, q.position`,
      ).all(),
    ]);
    return apiSuccess({
      lessons: lessons.results,
      blocks: blocks.results,
      questions: questions.results,
    });
  } catch (error) {
    return apiFailure(error);
  }
}
