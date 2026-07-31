import type { NextRequest } from "next/server";
import { z } from "zod";
import { gradeQuiz } from "../../../../lib/chemistry";
import { curriculumLessons } from "../../../../lib/data";
import { requireActor } from "../../../../server/auth";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";

const attemptInput = z.object({
  quizId: z.string().min(1).max(100),
  answers: z.array(z.object({
    questionId: z.string().min(1).max(100),
    answer: z.string().max(500),
  })).min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "quiz-attempt", 12);
    const actor = await requireActor(request);
    const parsed = attemptInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Тест жауаптарының форматы дұрыс емес");
    }

    const db = getD1();
    const storedQuestions = await db
      .prepare(
        `SELECT id, correct_answer AS correctAnswer, explanation
         FROM questions WHERE quiz_id = ? AND deleted_at IS NULL ORDER BY position`,
      )
      .bind(parsed.data.quizId)
      .all<{ id: string; correctAnswer: string; explanation: string }>();
    const staticLesson = curriculumLessons.find((lesson) => `quiz:${lesson.id.replace("lesson:", "")}` === parsed.data.quizId);
    const usesStaticQuestions = !storedQuestions.results.length && !!staticLesson;
    const questions = storedQuestions.results.length
      ? storedQuestions.results
      : staticLesson?.quiz.map((question, index) => ({
        id: `${staticLesson.id}:q${index + 1}`,
        correctAnswer: question.options[question.answer],
        explanation: question.explanation,
      })) ?? [];
    if (!questions.length) throw new ApiError(404, "QUIZ_NOT_FOUND", "Тест табылмады");

    const answerMap = new Map(parsed.data.answers.map((item) => [item.questionId, item.answer.trim()]));
    const checked = questions.map((question) => ({
      questionId: question.id,
      answer: answerMap.get(question.id) ?? "",
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      isCorrect: (answerMap.get(question.id) ?? "").toLowerCase() === question.correctAnswer.toLowerCase(),
    }));
    const result = gradeQuiz(checked.filter((item) => item.isCorrect).length, checked.length);
    const attemptId = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO quiz_attempts (id, quiz_id, user_id, score, completed_at)
         VALUES (?, ?, ?, ?, unixepoch())`,
      )
      .bind(attemptId, parsed.data.quizId, actor.id, result.score)
      .run();
    if (!usesStaticQuestions) {
      await db.batch(checked.map((answer) =>
        db.prepare(
          `INSERT INTO quiz_answers (id, attempt_id, question_id, answer, is_correct)
           VALUES (?, ?, ?, ?, ?)`,
        ).bind(crypto.randomUUID(), attemptId, answer.questionId, answer.answer, answer.isCorrect ? 1 : 0),
      ));
    }

    let awardedXp = 0;
    if (result.passed) {
      const transaction = await db
        .prepare(
          `INSERT OR IGNORE INTO user_xp_transactions
           (id, user_id, amount, reason, reference_id, created_at)
           VALUES (?, ?, ?, 'QUIZ', ?, unixepoch())`,
        )
        .bind(`${actor.id}:QUIZ:${attemptId}`, actor.id, result.xp, attemptId)
        .run();
      if (transaction.meta.changes > 0) {
        awardedXp = result.xp;
        await db.prepare("UPDATE users SET xp = xp + ?, updated_at = unixepoch() WHERE id = ?")
          .bind(awardedXp, actor.id).run();
      }
    }

    return apiSuccess({ attemptId, ...result, xp: awardedXp, answers: checked });
  } catch (error) {
    return apiFailure(error);
  }
}
