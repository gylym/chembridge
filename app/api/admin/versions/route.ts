import type { NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "../../../../server/audit";
import { requirePermission } from "../../../../server/auth";
import { getD1 } from "../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../server/http";
import { enforceMutationSecurity } from "../../../../server/security";

const tables = {
  courses: "courses",
  modules: "modules",
  lessons: "lessons",
  blocks: "lesson_content_blocks",
  quizzes: "quizzes",
  questions: "questions",
  elements: "chemical_elements",
  reactions: "chemical_reactions",
  laboratories: "laboratory_experiments",
  videos: "video_lessons",
  syllabuses: "syllabuses",
  presentations: "presentations",
  assignments: "assignments",
  achievements: "achievements",
  challenges: "daily_challenges",
  settings: "site_settings",
  grades: "grade_levels",
  subjects: "subject_sections",
  pages: "pages",
  pageSections: "page_sections",
  texts: "global_texts",
  navigation: "navigation_items",
  media: "media_assets",
} as const;

function tableFor(entity: string) {
  if (!(entity in tables)) throw new ApiError(404, "UNKNOWN_CONTENT_TYPE", "Контент бөлімі табылмады");
  return tables[entity as keyof typeof tables];
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "edit_content");
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity") ?? "";
    const entityId = url.searchParams.get("id") ?? "";
    tableFor(entity);
    if (!entityId) throw new ApiError(400, "VALIDATION_ERROR", "Контент ID қажет");
    const rows = await getD1().prepare(
      `SELECT v.id, v.version, v.change_note AS changeNote, v.created_at AS createdAt,
              u.name AS createdBy
       FROM content_versions v JOIN users u ON u.id = v.created_by
       WHERE v.entity_type = ? AND v.entity_id = ?
       ORDER BY v.version DESC LIMIT 50`,
    ).bind(entity, entityId).all();
    return apiSuccess({ items: rows.results });
  } catch (error) {
    return apiFailure(error);
  }
}

const restoreInput = z.object({ versionId: z.string().min(1), entity: z.string().min(1), entityId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    await enforceMutationSecurity(request, "cms-version-restore", 20);
    const actor = await requirePermission(request, "publish_content");
    const parsed = restoreInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Нұсқа деректері дұрыс емес");
    const table = tableFor(parsed.data.entity);
    const db = getD1();
    const version = await db.prepare(
      `SELECT snapshot FROM content_versions
       WHERE id = ? AND entity_type = ? AND entity_id = ?`,
    ).bind(parsed.data.versionId, parsed.data.entity, parsed.data.entityId).first<{ snapshot: string }>();
    if (!version) throw new ApiError(404, "VERSION_NOT_FOUND", "Нұсқа табылмады");
    const snapshot = JSON.parse(version.snapshot) as Record<string, unknown>;
    const columnAliases: Record<string, string> = {
      seoTitle: "seo_title", seoDescription: "seo_description", scheduledAt: "scheduled_at",
      sectionKey: "section_key", pageId: "page_id", isVisible: "is_visible", requiredRole: "required_role",
      parentId: "parent_id", mimeType: "mime_type", altText: "alt_text", sizeBytes: "size_bytes",
      xpReward: "xp_reward", passScore: "pass_score", correctAnswer: "correct_answer",
      atomicNumber: "atomic_number", nameKk: "name_kk", balancedEquation: "balanced_equation",
      challengeDate: "challenge_date", courseId: "course_id", moduleId: "module_id",
      lessonId: "lesson_id", quizId: "quiz_id", prerequisiteId: "prerequisite_id",
      youtubeUrl: "youtube_url", youtubeVideoId: "youtube_video_id", durationMinutes: "duration_minutes",
      academicYear: "academic_year", pdfUrl: "pdf_url", fileSizeBytes: "file_size_bytes",
      fileUrl: "file_url", fileName: "file_name", slideCount: "slide_count", estimatedMinutes: "estimated_minutes",
      learningOutcome: "learning_outcome", expectedObservation: "expected_observation", visualEffect: "visual_effect",
    };
    const ignored = new Set(["id", "createdAt", "updatedAt", "publishedAt", "createdBy", "updatedBy"]);
    const entries = Object.entries(snapshot).filter(([key, value]) =>
      !ignored.has(key) && value !== undefined && /^[a-zA-Z][a-zA-Z0-9]*$/.test(key),
    );
    if (!entries.length) throw new ApiError(400, "EMPTY_VERSION", "Бұл нұсқада қалпына келетін дерек жоқ");
    const assignments = entries.map(([key]) => `${columnAliases[key] ?? key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} = ?`);
    await db.prepare(
      `UPDATE ${table} SET ${assignments.join(", ")}, updated_at = unixepoch(), deleted_at = NULL WHERE id = ?`,
    ).bind(...entries.map(([, value]) => typeof value === "object" ? JSON.stringify(value) : value), parsed.data.entityId).run();
    await writeAudit(actor, "CONTENT_VERSION_RESTORE", parsed.data.entity, parsed.data.entityId, { versionId: parsed.data.versionId });
    return apiSuccess({ restored: true });
  } catch (error) {
    return apiFailure(error);
  }
}
