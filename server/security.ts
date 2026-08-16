import type { NextRequest } from "next/server";
import { getD1 } from "./database";
import { ApiError } from "./http";

export async function enforceMutationSecurity(
  request: NextRequest,
  scope: string,
  limit = 30,
  windowSeconds = 60,
) {
  const origin = request.headers.get("origin");
  if (origin) {
    const expectedOrigin = new URL(request.url).origin;
    const normalizedOrigin = origin.trim().replace(/\/$/, "");
    const allowedCrossOrigin = normalizedOrigin === "https://gylym.github.io";
    if (normalizedOrigin !== expectedOrigin && !allowedCrossOrigin) {
      throw new ApiError(403, "CSRF_REJECTED", "Сұрау шыққан мекенжай расталмады");
    }
  }

  const identity = request.headers.get("oai-authenticated-user-email")
    ?? request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")
    ?? "anonymous";
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / windowSeconds);
  const key = `${scope}:${identity.toLowerCase().slice(0, 180)}`;
  const db = getD1();

  await db
    .prepare(
      `INSERT INTO rate_limit_buckets (key, bucket, count, expires_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1`,
    )
    .bind(key, bucket, (bucket + 2) * windowSeconds)
    .run();
  const record = await db
    .prepare("SELECT count FROM rate_limit_buckets WHERE key = ? AND bucket = ?")
    .bind(key, bucket)
    .first<{ count: number }>();

  if ((record?.count ?? 0) > limit) {
    throw new ApiError(429, "RATE_LIMITED", "Тым көп сұрау жіберілді. Бір минуттан кейін қайталаңыз");
  }
}
