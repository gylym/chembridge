import { hash } from "bcryptjs";
import type { NextRequest } from "next/server";
import { registerInput } from "../../../../server/auth-validation";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";
import { createSession, setSessionCookie } from "../../../../server/sessions";

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "auth-register", 8, 15 * 60);
    const parsed = registerInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const fields = Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
      );
      throw new ApiError(400, "VALIDATION_ERROR", "Енгізілген деректерді тексеріңіз", fields);
    }

    const db = getD1();
    const { name, username, password, level, email } = parsed.data;
    const existing = await db.prepare(
      "SELECT id FROM users WHERE lower(username) = lower(?) AND deleted_at IS NULL",
    ).bind(username).first();
    if (existing) {
      throw new ApiError(409, "USERNAME_TAKEN", "Бұл логин бос емес", {
        username: "Бұл логин бос емес",
      });
    }

    const normalizedEmail = email
      ? email.toLowerCase()
      : `${username}@accounts.chembridge.local`;
    if (email) {
      const existingEmail = await db.prepare(
        "SELECT id FROM users WHERE lower(email) = lower(?) AND deleted_at IS NULL",
      ).bind(normalizedEmail).first();
      if (existingEmail) {
        throw new ApiError(409, "EMAIL_TAKEN", "Бұл email бұрын тіркелген", {
          email: "Бұл email бұрын тіркелген",
        });
      }
    }

    const id = `user:credential:${crypto.randomUUID()}`;
    const passwordHash = await hash(password, 11);
    const role = level === "Студент" ? "university_student" : "school_student";
    await db.prepare(
      `INSERT INTO users
       (id, username, email, name, password_hash, role, status, level, xp, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 0, unixepoch(), unixepoch())`,
    ).bind(id, username, normalizedEmail, name, passwordHash, role, level).run();

    const session = await createSession(id, false);
    const response = apiSuccess({
      user: { id, username, name, role, status: "active", level, xp: 0 },
      token: session.token,
    }, 201);
    setSessionCookie(
      response,
      session,
      new URL(request.url).protocol === "https:",
      request.headers.get("origin")?.trim().replace(/\/$/, "") === "https://gylym.github.io",
    );
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
