import type { NextRequest } from "next/server";
import { apiFailure, apiSuccess } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";
import { clearSessionCookie, deleteRequestSession } from "../../../../server/sessions";

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "auth-logout", 20);
    await deleteRequestSession(request);
    const response = apiSuccess({ signedOut: true });
    clearSessionCookie(
      response,
      new URL(request.url).protocol === "https:",
      request.headers.get("origin")?.trim().replace(/\/$/, "") === "https://gylym.github.io",
    );
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
