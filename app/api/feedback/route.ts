import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireActor } from "../../../server/auth";
import { sanitizeCmsText } from "../../../server/cms";
import { getD1 } from "../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../server/http";
import { enforceMutationSecurity } from "../../../server/security";

const input = z.object({
  category: z.enum(["technical", "lesson", "incorrect", "suggestion", "account", "other"]),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5_000),
  relatedPage: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "feedback", 5, 10 * 60);
    const actor = await requireActor(request);
    if (!["student", "school_student", "university_student"].includes(actor.role)) {
      throw new ApiError(403, "FORBIDDEN", "Кері байланыс формасы оқушылар мен студенттерге арналған");
    }
    const parsed = input.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const fields = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]));
      throw new ApiError(400, "VALIDATION_ERROR", "Тақырып пен хабарламаны толық жазыңыз", fields);
    }
    const db = getD1();
    const duplicate = await db.prepare(
      "SELECT id FROM feedback_messages WHERE user_id = ? AND subject = ? AND message = ? AND created_at > unixepoch() - 120",
    ).bind(actor.id, parsed.data.subject, parsed.data.message).first();
    if (duplicate) throw new ApiError(409, "DUPLICATE_FEEDBACK", "Бұл хабарлама жаңа ғана жіберілді");
    const id = `feedback:${crypto.randomUUID()}`;
    await db.prepare(
      `INSERT INTO feedback_messages (id, user_id, category, subject, message, related_page, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'new', unixepoch(), unixepoch())`,
    ).bind(id, actor.id, parsed.data.category, sanitizeCmsText(parsed.data.subject), sanitizeCmsText(parsed.data.message), parsed.data.relatedPage ? sanitizeCmsText(parsed.data.relatedPage) : null).run();
    return apiSuccess({ id, received: true }, 201);
  } catch (error) {
    return apiFailure(error);
  }
}
