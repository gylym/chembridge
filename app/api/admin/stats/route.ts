import type { NextRequest } from "next/server";
import { requirePermission } from "../../../../server/auth";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess } from "../../../../server/http";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "publish_content");
    const db = getD1();
    const row = await db.prepare(
      `SELECT
       (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS users,
       (SELECT COUNT(*) FROM lessons WHERE deleted_at IS NULL) AS lessons,
       (SELECT COUNT(*) FROM chemical_elements WHERE deleted_at IS NULL) AS elements,
       (SELECT COUNT(*) FROM chemical_reactions WHERE deleted_at IS NULL) AS reactions,
       (SELECT COUNT(*) FROM feedback_messages WHERE status = 'new' AND deleted_at IS NULL) AS unreadFeedback`,
    ).first();
    return apiSuccess(row ?? {});
  } catch (error) { return apiFailure(error); }
}
