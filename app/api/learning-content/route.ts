import { getD1 } from "../../../server/database";
import { apiFailure, apiSuccess } from "../../../server/http";

export async function GET() {
  try {
    const db = getD1();
    const [lessons, blocks, attachments, quizzes, questions] = await Promise.all([
      db.prepare(
        `SELECT l.id, l.title, l.objective, l.grade_level AS gradeLevel, l.xp_reward AS xpReward,
                m.title AS unit, c.title AS course,
                selected_qz.id AS quizId, selected_qz.pass_score AS passScore
         FROM lessons l
         JOIN modules m ON m.id = l.module_id
         JOIN courses c ON c.id = m.course_id
         LEFT JOIN quizzes selected_qz ON selected_qz.id = (
           SELECT q0.id FROM quizzes q0
           WHERE q0.lesson_id = l.id AND q0.status = 'published' AND q0.deleted_at IS NULL
           ORDER BY q0.updated_at DESC, q0.id DESC LIMIT 1
         )
         WHERE l.status = 'published'
           AND l.deleted_at IS NULL
           AND m.deleted_at IS NULL
           AND c.status = 'published'
           AND c.deleted_at IS NULL
         ORDER BY c.title, m.position, l.position`,
      ).all(),
      db.prepare(
        `SELECT b.id, b.lesson_id AS lessonId, b.type, b.content, b.position
         FROM lesson_content_blocks b
         JOIN lessons l ON l.id = b.lesson_id
         JOIN modules m ON m.id = l.module_id
         JOIN courses c ON c.id = m.course_id
         WHERE b.deleted_at IS NULL AND l.deleted_at IS NULL AND m.deleted_at IS NULL AND c.deleted_at IS NULL
           AND l.status = 'published' AND c.status = 'published'
         ORDER BY b.lesson_id, b.position`,
      ).all(),
      db.prepare(
        `SELECT b.lesson_id AS lessonId, b.type AS blockType, ma.id, ma.title, ma.url,
                ma.mime_type AS mimeType, ma.alt_text AS altText, lba.position
         FROM lesson_block_attachments lba
         JOIN lesson_content_blocks b ON b.id = lba.block_id
         JOIN lessons l ON l.id = b.lesson_id
         JOIN modules m ON m.id = l.module_id
         JOIN courses c ON c.id = m.course_id
         JOIN media_assets ma ON ma.id = lba.media_asset_id
         WHERE b.deleted_at IS NULL AND ma.deleted_at IS NULL
           AND l.deleted_at IS NULL AND m.deleted_at IS NULL AND c.deleted_at IS NULL
           AND l.status = 'published' AND c.status = 'published'
         ORDER BY b.lesson_id, b.position, lba.position`,
      ).all(),
      db.prepare(
        `SELECT qz.id, qz.lesson_id AS lessonId, qz.pass_score AS passScore
         FROM quizzes qz
         JOIN lessons l ON l.id = qz.lesson_id
         JOIN modules m ON m.id = l.module_id
         JOIN courses c ON c.id = m.course_id
         WHERE qz.id = (
           SELECT q0.id FROM quizzes q0
           WHERE q0.lesson_id = l.id AND q0.status = 'published' AND q0.deleted_at IS NULL
           ORDER BY q0.updated_at DESC, q0.id DESC LIMIT 1
         )
           AND l.status = 'published' AND l.deleted_at IS NULL
           AND m.deleted_at IS NULL AND c.status = 'published' AND c.deleted_at IS NULL
         ORDER BY qz.lesson_id`,
      ).all(),
      db.prepare(
        `SELECT qz.lesson_id AS lessonId, q.id, q.id AS questionId, q.prompt,
                qz.id AS quizId, qz.pass_score AS passScore,
                '' AS correctAnswer, '' AS explanation, q.position, q.options
         FROM questions q
         JOIN quizzes qz ON qz.id = q.quiz_id
         JOIN lessons l ON l.id = qz.lesson_id
         JOIN modules m ON m.id = l.module_id
         JOIN courses c ON c.id = m.course_id
         WHERE q.deleted_at IS NULL
           AND qz.deleted_at IS NULL
           AND qz.status = 'published'
           AND qz.id = (
             SELECT q0.id FROM quizzes q0
             WHERE q0.lesson_id = l.id AND q0.status = 'published' AND q0.deleted_at IS NULL
             ORDER BY q0.updated_at DESC, q0.id DESC LIMIT 1
           )
           AND l.status = 'published' AND l.deleted_at IS NULL
           AND m.deleted_at IS NULL AND c.status = 'published' AND c.deleted_at IS NULL
         ORDER BY qz.lesson_id, q.position`,
      ).all(),
    ]);
    return apiSuccess({
      lessons: lessons.results,
      blocks: blocks.results,
      attachments: attachments.results,
      quizzes: quizzes.results,
      questions: questions.results,
    });
  } catch (error) {
    return apiFailure(error);
  }
}
