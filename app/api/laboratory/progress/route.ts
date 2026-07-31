import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireActor } from "../../../../server/auth";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";

const input = z.object({ experimentId: z.string().min(1).max(200), currentStep: z.number().int().min(0).max(100) });

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "lab-progress", 60);
    const actor = await requireActor(request);
    const parsed = input.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Тәжірибе қадамы дұрыс емес");
    const db = getD1();
    const count = await db.prepare("SELECT COUNT(*) AS count FROM experiment_steps WHERE experiment_id = ?").bind(parsed.data.experimentId).first<{ count: number }>();
    const total = Math.max(1, Number(count?.count ?? 0));
    const nextStep = Math.min(parsed.data.currentStep, total);
    await db.prepare(
      `INSERT INTO experiment_progress (id, user_id, experiment_id, current_step, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())
       ON CONFLICT(user_id, experiment_id) DO UPDATE SET current_step = MAX(current_step, excluded.current_step),
       completed_at = COALESCE(completed_at, excluded.completed_at), updated_at = unixepoch()`,
    ).bind(crypto.randomUUID(), actor.id, parsed.data.experimentId, nextStep, nextStep >= total ? Math.floor(Date.now() / 1000) : null).run();
    return apiSuccess({ currentStep: nextStep, completed: nextStep >= total });
  } catch (error) { return apiFailure(error); }
}
