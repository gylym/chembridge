import { compare } from "bcryptjs";
import type { NextRequest } from "next/server";
import { loginInput } from "../../../../server/auth-validation";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";
import { createSession, setSessionCookie } from "../../../../server/sessions";
import type { Actor } from "../../../../server/auth";

type LoginUser = Actor & { passwordHash: string | null };

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "auth-login", 10, 15 * 60);
    const parsed = loginInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Логин немесе құпиясөз қате");
    }

    const db = getD1();
    const user = await db.prepare(
      `SELECT id, email, username, name, password_hash AS passwordHash,
              role, status, level, xp
       FROM users WHERE (lower(username) = lower(?) OR lower(email) = lower(?)) AND deleted_at IS NULL`,
    ).bind(parsed.data.username, parsed.data.username).first<LoginUser>();

    const valid = user?.passwordHash
      ? await compare(parsed.data.password, user.passwordHash)
      : false;
    if (!user || !valid) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Логин немесе құпиясөз қате");
    }
    if (user.status !== "active") {
      throw new ApiError(403, "ACCOUNT_UNAVAILABLE", "Аккаунт уақытша қолжетімсіз");
    }

    const session = await createSession(user.id, parsed.data.remember);
    await db.prepare("UPDATE users SET last_login_at = unixepoch(), updated_at = unixepoch() WHERE id = ?")
      .bind(user.id).run();
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
      level: user.level,
      xp: user.xp,
    };
    const response = apiSuccess({ user: safeUser });
    setSessionCookie(response, session, new URL(request.url).protocol === "https:");
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
