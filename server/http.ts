import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, {
    status,
    headers: { "Cache-Control": "no-store, private" },
  });
}

export function apiFailure(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message, fields: error.fields } },
      { status: error.status, headers: { "Cache-Control": "no-store, private" } },
    );
  }
  console.error(error);
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Күтпеген сервер қатесі орын алды",
      },
    },
    { status: 500, headers: { "Cache-Control": "no-store, private" } },
  );
}
