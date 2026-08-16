import type { NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "../../../../../server/audit";
import { requirePermission } from "../../../../../server/auth";
import { createContentVersion, sanitizeCmsText, workflowStatuses } from "../../../../../server/cms";
import { getD1 } from "../../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../../server/http";
import { enforceMutationSecurity } from "../../../../../server/security";
import { requireLessonEditAccess } from "../../../../../server/lesson-access";

const blockTypes = ["theory", "formula", "example", "remember"] as const;

const editorInput = z.object({
  lesson: z.object({
    slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9-]+$/),
    title: z.string().trim().min(2).max(200),
    objective: z.string().trim().min(2).max(20_000),
    gradeLevel: z.enum(["7-сынып", "8-сынып", "9-сынып", "10-сынып", "11-сынып", "Студент"]),
    status: z.enum(workflowStatuses),
    position: z.coerce.number().int().min(1).max(10_000),
    xpReward: z.coerce.number().int().min(0).max(10_000),
  }),
  blocks: z.array(z.object({
    type: z.enum(blockTypes),
    content: z.string().trim().max(20_000),
    position: z.coerce.number().int().min(1).max(100),
    attachmentIds: z.array(z.string().min(1).max(200)).max(12),
  })).length(4),
  quiz: z.object({
    title: z.string().trim().min(2).max(200),
    passScore: z.coerce.number().int().min(0).max(100),
    status: z.enum(workflowStatuses),
  }),
  questions: z.array(z.object({
    id: z.string().max(200).optional(),
    prompt: z.string().trim().min(2).max(20_000),
    options: z.array(z.string().trim().min(1).max(2_000)).length(4),
    correctAnswerIndex: z.coerce.number().int().min(0).max(3),
    explanation: z.string().trim().min(2).max(20_000),
    position: z.coerce.number().int().min(1).max(3),
  })).length(3),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requirePermission(request, "edit_content");
    const { id } = await params;
    await requireLessonEditAccess(actor, id);
    const db = getD1();
    const lesson = await db.prepare(
      `SELECT id, slug, title, objective, grade_level AS gradeLevel, status, position, xp_reward AS xpReward
       FROM lessons WHERE id = ? AND deleted_at IS NULL`,
    ).bind(id).first<Record<string, unknown>>();
    if (!lesson) throw new ApiError(404, "NOT_FOUND", "Сабақ табылмады");
    const [blocks, attachments, quiz] = await Promise.all([
      db.prepare(
        `SELECT id, type, content, position FROM lesson_content_blocks
         WHERE lesson_id = ? AND type IN ('theory','formula','example','remember') AND deleted_at IS NULL
         ORDER BY position`,
      ).bind(id).all(),
      db.prepare(
        `SELECT lba.block_id AS blockId, ma.id, ma.title, ma.url, ma.mime_type AS mimeType, ma.alt_text AS altText
         FROM lesson_block_attachments lba
         JOIN lesson_content_blocks b ON b.id = lba.block_id
         JOIN media_assets ma ON ma.id = lba.media_asset_id
         WHERE b.lesson_id = ? AND b.deleted_at IS NULL AND ma.deleted_at IS NULL
         ORDER BY lba.block_id, lba.position`,
      ).bind(id).all(),
      db.prepare(
        `SELECT id, title, pass_score AS passScore, status FROM quizzes
         WHERE lesson_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1`,
      ).bind(id).first<Record<string, unknown>>(),
    ]);
    const questions = quiz ? await db.prepare(
      `SELECT id, prompt, correct_answer AS correctAnswer, explanation, position, options
       FROM questions WHERE quiz_id = ? AND deleted_at IS NULL ORDER BY position LIMIT 3`,
    ).bind(String(quiz.id)).all() : { results: [] };
    return apiSuccess({ lesson, blocks: blocks.results, attachments: attachments.results, quiz, questions: questions.results });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await enforceMutationSecurity(request, "lesson-editor-update", 30);
    const actor = await requirePermission(request, "edit_content");
    const { id } = await params;
    await requireLessonEditAccess(actor, id);
    const parsed = editorInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Сабақ өрістерін және 3 сұрақты толық толтырыңыз");
    if (actor.role === "teacher" && (parsed.data.lesson.status === "published" || parsed.data.quiz.status === "published")) {
      throw new ApiError(403, "PUBLISH_FORBIDDEN", "Мұғалім контентті тек тексеруге жібере алады");
    }
    const db = getD1();
    const before = await db.prepare(
      `SELECT id, slug, title, objective, grade_level AS gradeLevel, status, position, xp_reward AS xpReward
       FROM lessons WHERE id = ? AND deleted_at IS NULL`,
    ).bind(id).first<Record<string, unknown>>();
    if (!before) throw new ApiError(404, "NOT_FOUND", "Сабақ табылмады");
    await createContentVersion(db, actor, "lessons", id, before, "Толық сабақ редакторы");

    const statements = [
      db.prepare(
        `UPDATE lessons SET slug = ?, title = ?, objective = ?, grade_level = ?, status = ?, position = ?, xp_reward = ?, updated_at = unixepoch()
         WHERE id = ? AND deleted_at IS NULL`,
      ).bind(
        sanitizeCmsText(parsed.data.lesson.slug), sanitizeCmsText(parsed.data.lesson.title),
        sanitizeCmsText(parsed.data.lesson.objective), parsed.data.lesson.gradeLevel, parsed.data.lesson.status,
        parsed.data.lesson.position, parsed.data.lesson.xpReward, id,
      ),
    ];

    const existingBlocks = await db.prepare(
      `SELECT id, type FROM lesson_content_blocks
       WHERE lesson_id = ? AND type IN ('theory','formula','example','remember') AND deleted_at IS NULL ORDER BY position`,
    ).bind(id).all<{ id: string; type: string }>();
    const usedBlockIds = new Set<string>();
    for (const block of parsed.data.blocks) {
      const existing = existingBlocks.results.find((item) => item.type === block.type && !usedBlockIds.has(item.id));
      const blockId = existing?.id ?? `block:${crypto.randomUUID()}`;
      usedBlockIds.add(blockId);
      if (existing) {
        statements.push(db.prepare(
          "UPDATE lesson_content_blocks SET content = ?, position = ?, deleted_at = NULL, updated_at = unixepoch() WHERE id = ?",
        ).bind(sanitizeCmsText(block.content), block.position, blockId));
      } else {
        statements.push(db.prepare(
          `INSERT INTO lesson_content_blocks (id, lesson_id, type, content, position, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
        ).bind(blockId, id, block.type, sanitizeCmsText(block.content), block.position));
      }
      statements.push(db.prepare("DELETE FROM lesson_block_attachments WHERE block_id = ?").bind(blockId));
      block.attachmentIds.forEach((mediaId, index) => statements.push(db.prepare(
        `INSERT INTO lesson_block_attachments (id, block_id, media_asset_id, position, created_at)
         VALUES (?, ?, ?, ?, unixepoch())`,
      ).bind(crypto.randomUUID(), blockId, mediaId, index + 1)));
    }
    existingBlocks.results.filter((item) => !usedBlockIds.has(item.id)).forEach((item) => {
      statements.push(db.prepare("UPDATE lesson_content_blocks SET deleted_at = unixepoch(), updated_at = unixepoch() WHERE id = ?").bind(item.id));
    });

    const existingQuiz = await db.prepare(
      "SELECT id FROM quizzes WHERE lesson_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1",
    ).bind(id).first<{ id: string }>();
    const quizId = existingQuiz?.id ?? `quiz:${crypto.randomUUID()}`;
    if (existingQuiz) {
      statements.push(db.prepare(
        "UPDATE quizzes SET title = ?, pass_score = ?, status = ?, updated_at = unixepoch() WHERE id = ?",
      ).bind(sanitizeCmsText(parsed.data.quiz.title), parsed.data.quiz.passScore, parsed.data.quiz.status, quizId));
    } else {
      statements.push(db.prepare(
        `INSERT INTO quizzes (id, lesson_id, title, pass_score, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
      ).bind(quizId, id, sanitizeCmsText(parsed.data.quiz.title), parsed.data.quiz.passScore, parsed.data.quiz.status));
    }
    const existingQuestions = await db.prepare(
      "SELECT id FROM questions WHERE quiz_id = ? AND deleted_at IS NULL ORDER BY position",
    ).bind(quizId).all<{ id: string }>();
    const usedQuestionIds = new Set<string>();
    for (const question of parsed.data.questions) {
      const matching = question.id && existingQuestions.results.some((item) => item.id === question.id) ? question.id : undefined;
      const questionId = matching ?? `question:${crypto.randomUUID()}`;
      usedQuestionIds.add(questionId);
      const correctAnswer = question.options[question.correctAnswerIndex];
      if (matching) {
        statements.push(db.prepare(
          `UPDATE questions SET type = 'single', prompt = ?, correct_answer = ?, explanation = ?, position = ?, options = ?, deleted_at = NULL, updated_at = unixepoch()
           WHERE id = ?`,
        ).bind(sanitizeCmsText(question.prompt), sanitizeCmsText(correctAnswer), sanitizeCmsText(question.explanation), question.position, JSON.stringify(question.options.map(sanitizeCmsText)), questionId));
      } else {
        statements.push(db.prepare(
          `INSERT INTO questions (id, quiz_id, type, prompt, correct_answer, explanation, position, options, created_at, updated_at)
           VALUES (?, ?, 'single', ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
        ).bind(questionId, quizId, sanitizeCmsText(question.prompt), sanitizeCmsText(correctAnswer), sanitizeCmsText(question.explanation), question.position, JSON.stringify(question.options.map(sanitizeCmsText))));
      }
    }
    existingQuestions.results.filter((item) => !usedQuestionIds.has(item.id)).forEach((item) => {
      statements.push(db.prepare("UPDATE questions SET deleted_at = unixepoch(), updated_at = unixepoch() WHERE id = ?").bind(item.id));
    });
    await db.batch(statements);
    await writeAudit(actor, "LESSON_FULL_UPDATE", "lessons", id, { blocks: 4, questions: 3 });
    return apiSuccess({ id });
  } catch (error) {
    return apiFailure(error);
  }
}
