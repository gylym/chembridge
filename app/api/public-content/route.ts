import { getD1 } from "../../../server/database";
import { apiFailure, apiSuccess } from "../../../server/http";

export async function GET() {
  try {
    const db = getD1();
    const [elements, pages, sections, texts, navigation, reactions, laboratories, labSteps, achievements, videos, syllabuses, presentations, assignments] = await Promise.all([
      db.prepare(
        `SELECT atomic_number AS atomicNumber, symbol, name_kk AS nameKk, details
         FROM chemical_elements WHERE deleted_at IS NULL ORDER BY atomic_number LIMIT 118`,
      ).all(),
      db.prepare(
        `SELECT id, slug, title, seo_title AS seoTitle, seo_description AS seoDescription
         FROM pages WHERE status = 'published' AND deleted_at IS NULL
         ORDER BY published_at DESC`,
      ).all(),
      db.prepare(
        `SELECT page_id AS pageId, section_key AS sectionKey, type, title, body, payload, position
         FROM page_sections
         WHERE status = 'published' AND is_visible = 1 AND deleted_at IS NULL
         ORDER BY page_id, position`,
      ).all(),
      db.prepare(
        `SELECT key, locale, value FROM global_texts
         WHERE deleted_at IS NULL ORDER BY key`,
      ).all(),
      db.prepare(
        `SELECT menu, label, href, icon, position, required_role AS requiredRole
         FROM navigation_items
         WHERE is_visible = 1 AND deleted_at IS NULL ORDER BY menu, position`,
      ).all(),
      db.prepare(
        `SELECT id, equation, balanced_equation AS balancedEquation, type, hint
         FROM chemical_reactions WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 100`,
      ).all(),
      db.prepare(
        `SELECT id, title, description, safety, objective, learning_outcome AS learningOutcome,
                equipment, reagents, expected_observation AS expectedObservation, equation,
                explanation, conclusion, visual_effect AS visualEffect
         FROM laboratory_experiments
         WHERE status = 'published' AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 50`,
      ).all(),
      db.prepare(
        `SELECT experiment_id AS experimentId, instruction, position
         FROM experiment_steps ORDER BY experiment_id, position`,
      ).all(),
      db.prepare(
        `SELECT id, code, title, description, xp_reward AS xpReward
         FROM achievements WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 100`,
      ).all(),
      db.prepare(
        `SELECT id, title, slug, description, youtube_video_id AS youtubeVideoId, author,
                level, topic, duration_minutes AS durationMinutes, difficulty, position
         FROM video_lessons WHERE status = 'published' AND deleted_at IS NULL
         ORDER BY level, position, published_at DESC LIMIT 200`,
      ).all(),
      db.prepare(
        `SELECT id, title, description, level, academic_year AS academicYear, semester,
                language, author, pdf_url AS pdfUrl, file_size_bytes AS fileSizeBytes, version
         FROM syllabuses WHERE status = 'published' AND deleted_at IS NULL
         ORDER BY academic_year DESC, title LIMIT 200`,
      ).all(),
      db.prepare(
        `SELECT id, title, description, level, topic, author, file_url AS fileUrl,
                file_name AS fileName, mime_type AS mimeType, file_size_bytes AS fileSizeBytes,
                slide_count AS slideCount, position
         FROM presentations WHERE status = 'published' AND deleted_at IS NULL
         ORDER BY level, position, published_at DESC LIMIT 200`,
      ).all(),
      db.prepare(
        `SELECT id, title, description, instructions, level, topic, author, file_url AS fileUrl,
                file_name AS fileName, mime_type AS mimeType, file_size_bytes AS fileSizeBytes,
                estimated_minutes AS estimatedMinutes, position
         FROM assignments WHERE status = 'published' AND deleted_at IS NULL
         ORDER BY level, position, published_at DESC LIMIT 200`,
      ).all(),
    ]);
    return apiSuccess({
      pages: pages.results,
      sections: sections.results,
      texts: texts.results,
      navigation: navigation.results,
      elements: elements.results,
      reactions: reactions.results,
      laboratories: laboratories.results,
      laboratorySteps: labSteps.results,
      achievements: achievements.results,
      videos: videos.results,
      syllabuses: syllabuses.results,
      presentations: presentations.results,
      assignments: assignments.results,
    });
  } catch (error) {
    return apiFailure(error);
  }
}
