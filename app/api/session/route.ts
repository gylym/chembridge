import type { NextRequest } from "next/server";
import { apiFailure, apiSuccess } from "../../../server/http";
import { requireActor } from "../../../server/auth";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor(request);
    return apiSuccess(actor);
  } catch (error) {
    return apiFailure(error);
  }
}
