import type { NextRequest } from "next/server";
import { requireRole } from "../../../../server/auth";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess } from "../../../../server/http";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const db = getD1();
    const rows = await db.prepare(
      `SELECT a.id, a.action, a.entity_type AS entityType, a.entity_id AS entityId,
              a.payload, a.created_at AS createdAt, u.name AS actorName
       FROM audit_logs a JOIN users u ON u.id = a.actor_id
       ORDER BY a.created_at DESC LIMIT 50`,
    ).all();
    return apiSuccess({ items: rows.results });
  } catch (error) {
    return apiFailure(error);
  }
}
