import type { NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "../../../../../server/audit";
import { requirePermission } from "../../../../../server/auth";
import { assertPublishable, createContentVersion, sanitizeCmsText, workflowStatuses } from "../../../../../server/cms";
import { getD1 } from "../../../../../server/database";
import { apiFailure, apiSuccess, ApiError } from "../../../../../server/http";
import { enforceMutationSecurity } from "../../../../../server/security";
import { assertSafePdfUrl, extractYouTubeVideoId } from "../../../../../server/media-validation";

const entityConfig = {
  courses: {
    table: "courses",
    select: "id, slug, title, description, status, created_at AS createdAt, updated_at AS updatedAt",
    searchable: ["title", "description", "slug"],
    editable: ["slug", "title", "description", "status"],
  },
  modules: {
    table: "modules",
    select: "id, course_id AS courseId, title, position, prerequisite_id AS prerequisiteId, updated_at AS updatedAt",
    searchable: ["title"],
    editable: ["title", "position", "prerequisite_id"],
  },
  lessons: {
    table: "lessons",
    select: "id, module_id AS moduleId, slug, title, objective, status, position, xp_reward AS xpReward, updated_at AS updatedAt",
    searchable: ["title", "objective", "slug"],
    editable: ["slug", "title", "objective", "status", "position", "xp_reward"],
  },
  blocks: {
    table: "lesson_content_blocks",
    select: "id, lesson_id AS lessonId, type, content, position, updated_at AS updatedAt",
    searchable: ["type", "content"],
    editable: ["type", "content", "position"],
  },
  quizzes: {
    table: "quizzes",
    select: "id, lesson_id AS lessonId, title, pass_score AS passScore, status, updated_at AS updatedAt",
    searchable: ["title"],
    editable: ["title", "pass_score", "status"],
  },
  questions: {
    table: "questions",
    select: "id, quiz_id AS quizId, type, prompt, correct_answer AS correctAnswer, explanation, position, updated_at AS updatedAt",
    searchable: ["type", "prompt", "explanation"],
    editable: ["type", "prompt", "correct_answer", "explanation", "position"],
  },
  elements: {
    table: "chemical_elements",
    select: "id, atomic_number AS atomicNumber, symbol, name_kk AS nameKk, details, updated_at AS updatedAt",
    searchable: ["symbol", "name_kk"],
    editable: ["symbol", "name_kk", "details"],
  },
  reactions: {
    table: "chemical_reactions",
    select: "id, equation, balanced_equation AS balancedEquation, type, hint, updated_at AS updatedAt",
    searchable: ["equation", "balanced_equation", "type"],
    editable: ["equation", "balanced_equation", "type", "hint"],
  },
  laboratories: {
    table: "laboratory_experiments",
    select: "id, title, description, safety, objective, learning_outcome AS learningOutcome, equipment, reagents, expected_observation AS expectedObservation, equation, explanation, conclusion, visual_effect AS visualEffect, status, updated_at AS updatedAt",
    searchable: ["title", "description", "objective", "reagents"],
    editable: ["title", "description", "safety", "objective", "learning_outcome", "equipment", "reagents", "expected_observation", "equation", "explanation", "conclusion", "visual_effect", "status"],
  },
  videos: {
    table: "video_lessons",
    select: "id, title, slug, description, youtube_url AS youtubeUrl, youtube_video_id AS youtubeVideoId, author, level, course_id AS courseId, topic, duration_minutes AS durationMinutes, difficulty, position, status, published_at AS publishedAt, updated_at AS updatedAt",
    searchable: ["title", "description", "author", "level", "topic"],
    editable: ["title", "slug", "description", "youtube_url", "youtube_video_id", "author", "level", "course_id", "topic", "duration_minutes", "difficulty", "position", "status", "published_at"],
  },
  syllabuses: {
    table: "syllabuses",
    select: "id, title, description, level, course_id AS courseId, academic_year AS academicYear, semester, language, author, pdf_url AS pdfUrl, file_size_bytes AS fileSizeBytes, version, status, published_at AS publishedAt, updated_at AS updatedAt",
    searchable: ["title", "description", "level", "academic_year", "author"],
    editable: ["title", "description", "level", "course_id", "academic_year", "semester", "language", "author", "pdf_url", "file_size_bytes", "version", "status", "published_at"],
  },
  achievements: {
    table: "achievements",
    select: "id, code, title, description, xp_reward AS xpReward, updated_at AS updatedAt",
    searchable: ["code", "title", "description"],
    editable: ["code", "title", "description", "xp_reward"],
  },
  challenges: {
    table: "daily_challenges",
    select: "id, challenge_date AS challengeDate, title, payload, xp_reward AS xpReward, updated_at AS updatedAt",
    searchable: ["challenge_date", "title"],
    editable: ["challenge_date", "title", "payload", "xp_reward"],
  },
  settings: {
    table: "site_settings",
    select: "id, key, value, updated_by AS updatedBy, updated_at AS updatedAt",
    searchable: ["key", "value"],
    editable: ["key", "value"],
  },
  grades: {
    table: "grade_levels",
    select: "id, code, title, position, status, updated_at AS updatedAt",
    searchable: ["code", "title"],
    editable: ["code", "title", "position", "status"],
  },
  subjects: {
    table: "subject_sections",
    select: "id, slug, title, description, position, status, updated_at AS updatedAt",
    searchable: ["slug", "title", "description"],
    editable: ["slug", "title", "description", "position", "status"],
  },
  pages: {
    table: "pages",
    select: "id, slug, title, seo_title AS seoTitle, seo_description AS seoDescription, status, scheduled_at AS scheduledAt, published_at AS publishedAt, updated_at AS updatedAt",
    searchable: ["slug", "title", "seo_title", "seo_description"],
    editable: ["slug", "title", "seo_title", "seo_description", "status", "scheduled_at"],
  },
  pageSections: {
    table: "page_sections",
    select: "id, page_id AS pageId, section_key AS sectionKey, type, title, body, payload, position, is_visible AS isVisible, status, updated_at AS updatedAt",
    searchable: ["section_key", "type", "title", "body"],
    editable: ["section_key", "type", "title", "body", "payload", "position", "is_visible", "status"],
  },
  texts: {
    table: "global_texts",
    select: "id, key, locale, value, description, updated_at AS updatedAt",
    searchable: ["key", "value", "description"],
    editable: ["key", "locale", "value", "description"],
  },
  navigation: {
    table: "navigation_items",
    select: "id, menu, label, href, icon, position, is_visible AS isVisible, required_role AS requiredRole, parent_id AS parentId, updated_at AS updatedAt",
    searchable: ["menu", "label", "href"],
    editable: ["menu", "label", "href", "icon", "position", "is_visible", "required_role", "parent_id"],
  },
  media: {
    table: "media_assets",
    select: "id, title, url, mime_type AS mimeType, alt_text AS altText, caption, folder, size_bytes AS sizeBytes, updated_at AS updatedAt",
    searchable: ["title", "url", "alt_text", "caption", "folder"],
    editable: ["title", "url", "mime_type", "alt_text", "caption", "folder"],
  },
} as const;

type Entity = keyof typeof entityConfig;

const contentInput = z.object({
  id: z.string().min(1).max(200),
  values: z.record(z.string(), z.union([z.string().max(20_000), z.number().int()])),
});

const createInput = z.object({
  values: z.record(z.string(), z.union([z.string().max(20_000), z.number().int()])),
});

const shortText = z.string().trim().min(1).max(200).transform(cleanValue);
const longText = z.string().trim().min(1).max(20_000).transform(cleanValue);
const status = z.enum(workflowStatuses);
const positivePosition = z.coerce.number().int().min(1).max(10_000);

function getConfig(entity: string) {
  if (!(entity in entityConfig)) {
    throw new ApiError(404, "UNKNOWN_CONTENT_TYPE", "Контент бөлімі табылмады");
  }
  return entityConfig[entity as Entity];
}

function cleanValue(value: string | number) {
  if (typeof value === "number") return value;
  return sanitizeCmsText(value);
}

function parseJson(value: string, field: string) {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    throw new ApiError(400, "VALIDATION_ERROR", `${field} JSON форматында болуы керек`);
  }
}

function buildCreation(entity: Entity, values: Record<string, string | number>, actorId: string) {
  const id = `${entity.slice(0, -1)}:${crypto.randomUUID()}`;
  switch (entity) {
    case "courses": {
      const data = z.object({
        title: shortText,
        slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
        description: longText,
        status,
      }).parse(values);
      return { id, columns: ["slug", "title", "description", "status", "author_id"], values: [data.slug, data.title, data.description, data.status, actorId] };
    }
    case "modules": {
      const data = z.object({ courseId: shortText, title: shortText, position: positivePosition, prerequisiteId: z.string().trim().max(200).optional() }).parse(values);
      return { id, columns: ["course_id", "title", "position", "prerequisite_id"], values: [data.courseId, data.title, data.position, data.prerequisiteId || null] };
    }
    case "lessons": {
      const data = z.object({
        moduleId: shortText,
        slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
        title: shortText,
        objective: longText,
        status,
        position: positivePosition,
        xpReward: z.coerce.number().int().min(0).max(10_000),
      }).parse(values);
      return { id, columns: ["module_id", "slug", "title", "objective", "status", "position", "xp_reward"], values: [data.moduleId, data.slug, data.title, data.objective, data.status, data.position, data.xpReward] };
    }
    case "blocks": {
      const data = z.object({ lessonId: shortText, type: z.enum(["theory", "heading", "formula", "example", "remember", "question", "definition", "key_concept", "chemical_equation", "real_life", "youtube", "pdf", "warning", "safety", "summary", "materials"]), content: longText, position: positivePosition }).parse(values);
      return { id, columns: ["lesson_id", "type", "content", "position"], values: [data.lessonId, data.type, data.content, data.position] };
    }
    case "quizzes": {
      const data = z.object({ lessonId: z.string().trim().max(200).optional(), title: shortText, passScore: z.coerce.number().int().min(0).max(100), status }).parse(values);
      return { id, columns: ["lesson_id", "title", "pass_score", "status"], values: [data.lessonId || null, data.title, data.passScore, data.status] };
    }
    case "questions": {
      const data = z.object({
        quizId: shortText,
        type: z.enum(["single", "multiple", "true_false", "matching", "formula", "reaction"]),
        prompt: longText,
        correctAnswer: longText,
        explanation: longText,
        position: positivePosition,
      }).parse(values);
      return { id, columns: ["quiz_id", "type", "prompt", "correct_answer", "explanation", "position"], values: [data.quizId, data.type, data.prompt, data.correctAnswer, data.explanation, data.position] };
    }
    case "elements": {
      const data = z.object({ atomicNumber: z.coerce.number().int().min(1).max(118), symbol: z.string().trim().min(1).max(3).regex(/^[A-Z][a-z]{0,2}$/), nameKk: shortText, details: z.string().trim().min(2).max(20_000) }).parse(values);
      return { id, columns: ["atomic_number", "symbol", "name_kk", "details"], values: [data.atomicNumber, data.symbol, data.nameKk, parseJson(data.details, "Элемент мәліметтері")] };
    }
    case "reactions": {
      const data = z.object({ equation: shortText, balancedEquation: shortText, type: shortText, hint: longText }).parse(values);
      return { id, columns: ["equation", "balanced_equation", "type", "hint"], values: [data.equation, data.balancedEquation, data.type, data.hint] };
    }
    case "laboratories": {
      const data = z.object({ title: shortText, description: longText, objective: longText, learningOutcome: longText, equipment: longText, reagents: longText, safety: longText, expectedObservation: longText, equation: shortText, explanation: longText, conclusion: longText, visualEffect: z.enum(["color", "gas", "precipitate", "temperature", "dissolve", "crystallize"]), status }).parse(values);
      return { id, columns: ["title", "description", "objective", "learning_outcome", "equipment", "reagents", "safety", "expected_observation", "equation", "explanation", "conclusion", "visual_effect", "status"], values: [data.title, data.description, data.objective, data.learningOutcome, data.equipment, data.reagents, data.safety, data.expectedObservation, data.equation, data.explanation, data.conclusion, data.visualEffect, data.status] };
    }
    case "videos": {
      const data = z.object({ title: shortText, slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/), description: longText, youtubeUrl: z.string().trim().max(2_000), author: shortText, level: shortText, courseId: z.string().trim().max(200).optional(), topic: shortText, durationMinutes: z.coerce.number().int().min(1).max(600), difficulty: shortText, position: positivePosition, status }).parse(values);
      const videoId = extractYouTubeVideoId(data.youtubeUrl);
      return { id, columns: ["title", "slug", "description", "youtube_url", "youtube_video_id", "author", "level", "course_id", "topic", "duration_minutes", "difficulty", "position", "status", "published_at", "created_by", "updated_by"], values: [data.title, data.slug, data.description, data.youtubeUrl, videoId, data.author, data.level, data.courseId || null, data.topic, data.durationMinutes, data.difficulty, data.position, data.status, data.status === "published" ? Math.floor(Date.now() / 1000) : null, actorId, actorId] };
    }
    case "syllabuses": {
      const data = z.object({ title: shortText, description: longText, level: shortText, courseId: z.string().trim().max(200).optional(), academicYear: z.string().trim().min(4).max(20), semester: shortText, language: shortText, author: shortText, pdfUrl: z.string().trim().max(2_000), version: shortText, status }).parse(values);
      return { id, columns: ["title", "description", "level", "course_id", "academic_year", "semester", "language", "author", "pdf_url", "version", "status", "published_at", "created_by", "updated_by"], values: [data.title, data.description, data.level, data.courseId || null, data.academicYear, data.semester, data.language, data.author, assertSafePdfUrl(data.pdfUrl), data.version, data.status, data.status === "published" ? Math.floor(Date.now() / 1000) : null, actorId, actorId] };
    }
    case "achievements": {
      const data = z.object({ code: z.string().trim().min(2).max(80).regex(/^[a-z0-9_]+$/), title: shortText, description: longText, xpReward: z.coerce.number().int().min(0).max(10_000) }).parse(values);
      return { id, columns: ["code", "title", "description", "xp_reward"], values: [data.code, data.title, data.description, data.xpReward] };
    }
    case "challenges": {
      const data = z.object({ challengeDate: z.string().date(), title: shortText, payload: z.string().trim().min(2).max(20_000), xpReward: z.coerce.number().int().min(0).max(10_000) }).parse(values);
      return { id, columns: ["challenge_date", "title", "payload", "xp_reward"], values: [data.challengeDate, data.title, parseJson(data.payload, "Тапсырма шарты"), data.xpReward] };
    }
    case "settings": {
      const data = z.object({ key: z.string().trim().min(2).max(100).regex(/^[a-z0-9_.-]+$/), value: z.string().trim().min(1).max(20_000) }).parse(values);
      return { id, columns: ["key", "value", "updated_by"], values: [data.key, parseJson(data.value, "Баптау мәні"), actorId] };
    }
    case "grades": {
      const data = z.object({ code: z.string().trim().min(1).max(24), title: shortText, position: positivePosition, status }).parse(values);
      return { id, columns: ["code", "title", "position", "status"], values: [data.code, data.title, data.position, data.status] };
    }
    case "subjects": {
      const data = z.object({ slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/), title: shortText, description: longText, position: positivePosition, status }).parse(values);
      return { id, columns: ["slug", "title", "description", "position", "status", "created_by", "updated_by"], values: [data.slug, data.title, data.description, data.position, data.status, actorId, actorId] };
    }
    case "pages": {
      const data = z.object({ slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/), title: shortText, seoTitle: z.string().trim().max(200).optional(), seoDescription: z.string().trim().max(500).optional(), status }).parse(values);
      return { id, columns: ["slug", "title", "seo_title", "seo_description", "status", "created_by", "updated_by"], values: [data.slug, data.title, cleanValue(data.seoTitle ?? ""), cleanValue(data.seoDescription ?? ""), data.status, actorId, actorId] };
    }
    case "pageSections": {
      const data = z.object({ pageId: shortText, sectionKey: z.string().trim().min(2).max(100).regex(/^[a-z0-9_.-]+$/), type: shortText, title: z.string().trim().max(200).optional(), body: z.string().trim().max(20_000).optional(), payload: z.string().trim().max(20_000).optional(), position: positivePosition, isVisible: z.coerce.number().int().min(0).max(1), status }).parse(values);
      return { id, columns: ["page_id", "section_key", "type", "title", "body", "payload", "position", "is_visible", "status", "created_by", "updated_by"], values: [data.pageId, data.sectionKey, data.type, cleanValue(data.title ?? ""), cleanValue(data.body ?? ""), data.payload ? parseJson(data.payload, "Секция деректері") : null, data.position, data.isVisible, data.status, actorId, actorId] };
    }
    case "texts": {
      const data = z.object({ key: z.string().trim().min(2).max(150).regex(/^[a-z0-9_.-]+$/), locale: z.string().trim().min(2).max(8), value: longText, description: z.string().trim().max(500).optional() }).parse(values);
      return { id, columns: ["key", "locale", "value", "description", "updated_by"], values: [data.key, data.locale, data.value, cleanValue(data.description ?? ""), actorId] };
    }
    case "navigation": {
      const data = z.object({ menu: shortText, label: shortText, href: z.string().trim().min(1).max(500), icon: z.string().trim().max(100).optional(), position: positivePosition, isVisible: z.coerce.number().int().min(0).max(1), requiredRole: z.string().trim().max(30).optional(), parentId: z.string().trim().max(200).optional() }).parse(values);
      if (/^(?:javascript|data):/i.test(data.href)) throw new ApiError(400, "UNSAFE_URL", "Қауіпсіз сілтеме енгізіңіз");
      return { id, columns: ["menu", "label", "href", "icon", "position", "is_visible", "required_role", "parent_id", "updated_by"], values: [data.menu, data.label, data.href, data.icon || null, data.position, data.isVisible, data.requiredRole || null, data.parentId || null, actorId] };
    }
    case "media": {
      const data = z.object({ title: shortText, url: z.string().url().max(2_000), mimeType: z.string().trim().min(3).max(100), altText: shortText, caption: z.string().trim().max(500).optional(), folder: z.string().trim().min(1).max(100) }).parse(values);
      if (!/^https:\/\//i.test(data.url)) throw new ApiError(400, "UNSAFE_URL", "Media URL HTTPS болуы керек");
      return { id, columns: ["title", "url", "mime_type", "alt_text", "caption", "folder", "uploaded_by"], values: [data.title, data.url, data.mimeType, data.altText, cleanValue(data.caption ?? ""), data.folder, actorId] };
    }
  }
}

async function getRelationOptions() {
  const db = getD1();
  const [courses, modules, lessons, quizzes] = await Promise.all([
    db.prepare("SELECT id, title AS label FROM courses WHERE deleted_at IS NULL ORDER BY title LIMIT 200").all(),
    db.prepare("SELECT id, title AS label FROM modules WHERE deleted_at IS NULL ORDER BY title LIMIT 300").all(),
    db.prepare("SELECT id, title AS label FROM lessons WHERE deleted_at IS NULL ORDER BY title LIMIT 500").all(),
    db.prepare("SELECT id, title AS label FROM quizzes WHERE deleted_at IS NULL ORDER BY title LIMIT 300").all(),
  ]);
  return { courses: courses.results, modules: modules.results, lessons: lessons.results, quizzes: quizzes.results };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    await requirePermission(request, "edit_content");
    const { entity } = await params;
    const config = getConfig(entity);
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") ?? "").slice(0, 100);
    const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0);
    const deletedOnly = url.searchParams.get("deleted") === "1";
    const where = config.searchable.map((column) => `${column} LIKE ?`).join(" OR ");
    const db = getD1();
    const rows = await db.prepare(
      `SELECT ${config.select} FROM ${config.table}
       WHERE (${where}) AND ${deletedOnly ? "deleted_at IS NOT NULL" : "deleted_at IS NULL"}
       ORDER BY updated_at DESC LIMIT 30 OFFSET ?`,
    ).bind(...config.searchable.map(() => `%${search}%`), offset).all();
    return apiSuccess({
      items: rows.results,
      nextOffset: rows.results.length === 30 ? offset + 30 : null,
      options: await getRelationOptions(),
    });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    await enforceMutationSecurity(request, "admin-content-create", 40);
    const actor = await requirePermission(request, "edit_content");
    const { entity: rawEntity } = await params;
    getConfig(rawEntity);
    const entity = rawEntity as Entity;
    const parsed = createInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Жаңа контент деректері дұрыс емес");
    const creation = buildCreation(entity, parsed.data.values, actor.id);
    const placeholders = creation.columns.map(() => "?").join(", ");
    const db = getD1();
    try {
      await db.prepare(
        `INSERT INTO ${entityConfig[entity].table} (id, ${creation.columns.join(", ")}) VALUES (?, ${placeholders})`,
      ).bind(creation.id, ...creation.values).run();
      if (entity === "lessons") {
        const blockTypes = ["theory", "formula", "example", "remember", "materials"] as const;
        const statements = blockTypes
          .map((type, index) => ({ type, index, content: parsed.data.values[type] }))
          .filter((item) => typeof item.content === "string" && item.content.trim())
          .map((item) => db.prepare(
            "INSERT INTO lesson_content_blocks (id, lesson_id, type, content, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())",
          ).bind(crypto.randomUUID(), creation.id, item.type, sanitizeCmsText(String(item.content)), item.index + 1));
        if (statements.length) await db.batch(statements);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/unique|constraint/i.test(message)) {
        throw new ApiError(409, "DUPLICATE_CONTENT", "Мұндай бірегей мәні бар контент бұрыннан бар");
      }
      throw error;
    }
    await writeAudit(actor, "CONTENT_CREATE", entity, creation.id, parsed.data.values);
    return apiSuccess({ id: creation.id }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiFailure(new ApiError(400, "VALIDATION_ERROR", "Міндетті өрістерді дұрыс толтырыңыз", z.flattenError(error).fieldErrors));
    }
    return apiFailure(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    await enforceMutationSecurity(request, "admin-content-update", 60);
    const actor = await requirePermission(request, "edit_content");
    const { entity } = await params;
    const config = getConfig(entity);
    const parsed = contentInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Контент деректері дұрыс емес");

    const db = getD1();
    const before = await db.prepare(
      `SELECT ${config.select} FROM ${config.table} WHERE id = ? AND deleted_at IS NULL`,
    ).bind(parsed.data.id).first<Record<string, unknown>>();
    if (!before) throw new ApiError(404, "NOT_FOUND", "Контент табылмады");

    const normalizedValues: Record<string, string | number> = { ...parsed.data.values };
    if (entity === "videos" && typeof normalizedValues.youtubeUrl === "string") {
      normalizedValues.youtubeVideoId = extractYouTubeVideoId(normalizedValues.youtubeUrl);
    }
    if (entity === "syllabuses" && typeof normalizedValues.pdfUrl === "string") {
      normalizedValues.pdfUrl = assertSafePdfUrl(normalizedValues.pdfUrl);
    }
    const assignments: string[] = [];
    const values: Array<string | number> = [];
    for (const [key, rawValue] of Object.entries(normalizedValues)) {
      const column = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      if (!config.editable.includes(column as never)) continue;
      assignments.push(`${column} = ?`);
      values.push(["payload", "details", "value"].includes(column)
        ? parseJson(String(rawValue), key)
        : cleanValue(rawValue));
    }
    if (!assignments.length) throw new ApiError(400, "NO_CHANGES", "Өзгертуге болатын өріс табылмады");
    assignments.push("updated_at = unixepoch()");
    if (normalizedValues.status === "published" && actor.role === "teacher") {
      throw new ApiError(403, "PUBLISH_FORBIDDEN", "Мұғалім контентті тек тексеруге жібере алады");
    }
    if (normalizedValues.status === "published") assertPublishable(entity, { ...before, ...normalizedValues });
    await createContentVersion(db, actor, entity, parsed.data.id, before);
    const result = await db.prepare(
      `UPDATE ${config.table} SET ${assignments.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
    ).bind(...values, parsed.data.id).run();
    if (result.meta.changes === 0) throw new ApiError(404, "NOT_FOUND", "Контент табылмады");
    await writeAudit(actor, "CONTENT_UPDATE", entity, parsed.data.id, parsed.data.values);
    return apiSuccess({ id: parsed.data.id, values: parsed.data.values });
  } catch (error) {
    return apiFailure(error);
  }
}

const deleteInput = z.object({
  id: z.string().min(1).max(200),
  restore: z.boolean().optional().default(false),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    await enforceMutationSecurity(request, "admin-content-delete", 40);
    const actor = await requirePermission(request, "edit_content");
    const { entity } = await params;
    const config = getConfig(entity);
    const parsed = deleteInput.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Контент идентификаторы дұрыс емес");
    const db = getD1();
    const before = await db.prepare(`SELECT ${config.select} FROM ${config.table} WHERE id = ?`)
      .bind(parsed.data.id).first<Record<string, unknown>>();
    if (!before) throw new ApiError(404, "NOT_FOUND", "Контент табылмады");
    await createContentVersion(db, actor, entity, parsed.data.id, before, parsed.data.restore ? "Қалпына келтіру" : "Soft delete");
    const result = await db.prepare(
      `UPDATE ${config.table} SET deleted_at = ${parsed.data.restore ? "NULL" : "unixepoch()"}, updated_at = unixepoch() WHERE id = ?`,
    ).bind(parsed.data.id).run();
    if (result.meta.changes === 0) throw new ApiError(404, "NOT_FOUND", "Контент табылмады");
    await writeAudit(actor, parsed.data.restore ? "CONTENT_RESTORE" : "CONTENT_SOFT_DELETE", entity, parsed.data.id);
    return apiSuccess({ id: parsed.data.id, restored: parsed.data.restore });
  } catch (error) {
    return apiFailure(error);
  }
}
