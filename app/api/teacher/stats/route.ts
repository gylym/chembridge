import type { NextRequest } from "next/server";
import { requirePermission } from "../../../../server/auth";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess } from "../../../../server/http";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "edit_content");
    const db = getD1();
    const row = await db.prepare(
      `SELECT
       (SELECT COUNT(*) FROM users WHERE role IN ('student','school_student','university_student') AND status = 'active' AND deleted_at IS NULL) AS students,
       (SELECT COUNT(*) FROM lessons WHERE deleted_at IS NULL) AS lessons,
       (SELECT COALESCE(ROUND(AVG(percent)), 0) FROM lesson_progress WHERE deleted_at IS NULL) AS averageProgress`,
    ).first();
    return apiSuccess(row ?? {});
  } catch (error) { return apiFailure(error); }
}
