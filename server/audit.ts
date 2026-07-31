import { getD1 } from "./database";
import type { Actor } from "./auth";

export async function writeAudit(
  actor: Actor,
  action: string,
  entityType: string,
  entityId: string,
  payload: unknown = null,
) {
  const db = getD1();
  await db
    .prepare(
      `INSERT INTO audit_logs
       (id, actor_id, action, entity_type, entity_id, payload, created_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      crypto.randomUUID(),
      actor.id,
      action,
      entityType,
      entityId,
      payload === null ? null : JSON.stringify(payload),
    )
    .run();
}
