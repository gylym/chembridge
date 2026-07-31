import type { NextRequest } from "next/server";
import { getD1 } from "./database";
import { ApiError } from "./http";
import { canAccess, hasPermission, type Permission, type Role } from "./permissions";
import { hashSessionToken, SESSION_COOKIE } from "./sessions";

export type { Role } from "./permissions";

export type Actor = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  role: Role;
  status: "active" | "suspended" | "deleted";
  level: string;
  xp: number;
};

export async function requireActor(request: NextRequest): Promise<Actor> {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    const db = getD1();
    const tokenHash = await hashSessionToken(sessionToken);
    const actor = await db.prepare(
      `SELECT u.id, u.email, u.username, u.name, u.role, u.status, u.level, u.xp
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > unixepoch()
         AND u.status = 'active' AND u.deleted_at IS NULL`,
    ).bind(tokenHash).first<Actor>();
    if (actor) {
      await db.prepare("UPDATE auth_sessions SET last_used_at = unixepoch() WHERE token_hash = ?")
        .bind(tokenHash).run();
      return actor;
    }
  }

  // ChemBridge uses only its own revocable credential sessions. Hosting
  // identity headers must never recreate an account after explicit logout.
  throw new ApiError(401, "UNAUTHORIZED", "Жүйеге кіру қажет");
}

export async function requireRole(request: NextRequest, allowed: Role[]) {
  const actor = await requireActor(request);
  if (!canAccess(actor.role, allowed)) {
    throw new ApiError(403, "FORBIDDEN", "Бұл әрекетке рұқсатыңыз жоқ");
  }
  return actor;
}

export async function requirePermission(request: NextRequest, permission: Permission) {
  const actor = await requireActor(request);
  if (!hasPermission(actor.role, permission)) {
    throw new ApiError(403, "FORBIDDEN", "Бұл әрекетке рұқсатыңыз жоқ");
  }
  return actor;
}
