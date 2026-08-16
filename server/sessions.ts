import type { NextRequest, NextResponse } from "next/server";
import { getD1 } from "./database";

export const SESSION_COOKIE = "chembridge_session";
export const SIGNED_OUT_COOKIE = "chembridge_signed_out";
const DAY = 24 * 60 * 60;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

export function newSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

export async function createSession(userId: string, remember: boolean) {
  const token = newSessionToken();
  const tokenHash = await hashSessionToken(token);
  const maxAge = remember ? 30 * DAY : DAY;
  const expiresAt = new Date(Date.now() + maxAge * 1000);
  const db = getD1();
  await db.prepare(
    `INSERT INTO auth_sessions (id, user_id, token_hash, expires_at, last_used_at, created_at)
     VALUES (?, ?, ?, ?, unixepoch(), unixepoch())`,
  ).bind(crypto.randomUUID(), userId, tokenHash, Math.floor(expiresAt.getTime() / 1000)).run();
  return { token, expiresAt, maxAge };
}

export function requestSessionToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim();
  return request.cookies.get(SESSION_COOKIE)?.value;
}

export function setSessionCookie(
  response: NextResponse,
  session: Awaited<ReturnType<typeof createSession>>,
  secure: boolean,
  crossOrigin = false,
) {
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure,
    sameSite: crossOrigin ? "none" : "lax",
    partitioned: crossOrigin,
    path: "/",
    maxAge: session.maxAge,
    expires: session.expiresAt,
  });
  response.cookies.set(SIGNED_OUT_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function deleteRequestSession(request: NextRequest) {
  const token = requestSessionToken(request);
  if (!token) return;
  const db = getD1();
  await db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?")
    .bind(await hashSessionToken(token))
    .run();
}

export function clearSessionCookie(response: NextResponse, secure: boolean, crossOrigin = false) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: crossOrigin ? "none" : "lax",
    partitioned: crossOrigin,
    path: "/",
    maxAge: 0,
  });
  // Prevent the hosting identity header from silently recreating an app session
  // after the user explicitly signs out of ChemBridge.
  response.cookies.set(SIGNED_OUT_COOKIE, "1", {
    httpOnly: true,
    secure,
    sameSite: crossOrigin ? "none" : "lax",
    partitioned: crossOrigin,
    path: "/",
    maxAge: 30 * DAY,
  });
}
