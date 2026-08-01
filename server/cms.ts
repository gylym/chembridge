import type { D1Database } from "@cloudflare/workers-types";
import type { Actor } from "./auth";
import { ApiError } from "./http";

export const workflowStatuses = ["draft", "in_review", "scheduled", "published", "archived"] as const;
export type WorkflowStatus = typeof workflowStatuses[number];

export function sanitizeCmsText(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*(?:javascript|data:text\/html):.*?\2/gi, "")
    .replace(/<\/?(?:iframe|object|embed|form|input|button)\b[^>]*>/gi, "")
    .trim();
}

export function assertPublishable(entity: string, record: Record<string, unknown>) {
  const requiredByEntity: Record<string, string[]> = {
    courses: ["title", "slug", "description"],
    lessons: ["title", "slug", "objective"],
    quizzes: ["title"],
    questions: ["prompt", "correctAnswer", "explanation"],
    reactions: ["equation", "balancedEquation", "type", "hint"],
    laboratories: ["title", "description", "objective", "safety", "expectedObservation", "equation", "conclusion"],
    videos: ["title", "slug", "description", "youtubeUrl", "youtubeVideoId", "level"],
    syllabuses: ["title", "description", "level", "academicYear", "pdfUrl"],
    presentations: ["title", "description", "level", "topic", "fileUrl", "fileName"],
    assignments: ["title", "description", "instructions", "level", "topic", "fileUrl", "fileName"],
    pages: ["title", "slug"],
    pageSections: ["sectionKey", "type"],
  };
  const missing = (requiredByEntity[entity] ?? []).filter((key) => {
    const value = record[key];
    return value === null || value === undefined || String(value).trim() === "";
  });
  if (missing.length) {
    throw new ApiError(400, "PUBLISH_VALIDATION_FAILED", `Жариялау үшін міндетті өрістерді толтырыңыз: ${missing.join(", ")}`);
  }
}

export async function createContentVersion(
  db: D1Database,
  actor: Actor,
  entityType: string,
  entityId: string,
  snapshot: Record<string, unknown>,
  changeNote?: string,
) {
  const versionRow = await db.prepare(
    "SELECT COALESCE(MAX(version), 0) + 1 AS version FROM content_versions WHERE entity_type = ? AND entity_id = ?",
  ).bind(entityType, entityId).first<{ version: number }>();
  const version = Number(versionRow?.version ?? 1);
  await db.prepare(
    `INSERT INTO content_versions
     (id, entity_type, entity_id, version, snapshot, change_note, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
  ).bind(
    crypto.randomUUID(),
    entityType,
    entityId,
    version,
    JSON.stringify(snapshot),
    changeNote?.slice(0, 500) || null,
    actor.id,
  ).run();
  return version;
}
