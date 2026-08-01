import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username"),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ["student", "school_student", "university_student", "teacher", "content_admin", "admin"] }).notNull().default("school_student"),
  status: text("status", { enum: ["active", "suspended", "deleted"] }).notNull().default("active"),
  level: text("level").notNull().default("10-сынып"),
  xp: integer("xp").notNull().default(0),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  ...timestamps,
}, (table) => [
  uniqueIndex("users_username_ci_uidx").on(table.username),
  index("users_role_status_idx").on(table.role, table.status),
]);

export const authSessions = sqliteTable("auth_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index("auth_sessions_user_idx").on(table.userId),
  index("auth_sessions_expiry_idx").on(table.expiresAt),
]);

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  authorId: text("author_id").references(() => users.id),
  ...timestamps,
});

export const modules = sqliteTable("modules", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  prerequisiteId: text("prerequisite_id"),
  ...timestamps,
}, (table) => [index("modules_course_position_idx").on(table.courseId, table.position)]);

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull().references(() => modules.id),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  position: integer("position").notNull(),
  xpReward: integer("xp_reward").notNull().default(50),
  ...timestamps,
}, (table) => [index("lessons_module_position_idx").on(table.moduleId, table.position)]);

export const lessonContentBlocks = sqliteTable("lesson_content_blocks", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").notNull().references(() => lessons.id),
  type: text("type").notNull(),
  content: text("content").notNull(),
  position: integer("position").notNull(),
  ...timestamps,
});

export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  courseId: text("course_id").notNull().references(() => courses.id),
  enrolledAt: integer("enrolled_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [uniqueIndex("enrollments_user_course_uidx").on(table.userId, table.courseId)]);

export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  lessonId: text("lesson_id").notNull().references(() => lessons.id),
  percent: integer("percent").notNull().default(0),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  ...timestamps,
}, (table) => [uniqueIndex("lesson_progress_user_lesson_uidx").on(table.userId, table.lessonId)]);

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").references(() => lessons.id),
  title: text("title").notNull(),
  passScore: integer("pass_score").notNull().default(70),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  ...timestamps,
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull().references(() => quizzes.id),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  position: integer("position").notNull(),
  ...timestamps,
});

export const questionOptions = sqliteTable("question_options", {
  id: text("id").primaryKey(),
  questionId: text("question_id").notNull().references(() => questions.id),
  label: text("label").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false),
});

export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull().references(() => quizzes.id),
  userId: text("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [index("quiz_attempts_user_idx").on(table.userId)]);

export const quizAnswers = sqliteTable("quiz_answers", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id").notNull().references(() => quizAttempts.id),
  questionId: text("question_id").notNull().references(() => questions.id),
  answer: text("answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
});

export const chemicalElements = sqliteTable("chemical_elements", {
  id: text("id").primaryKey(),
  atomicNumber: integer("atomic_number").notNull().unique(),
  symbol: text("symbol").notNull().unique(),
  nameKk: text("name_kk").notNull(),
  details: text("details", { mode: "json" }).notNull(),
  ...timestamps,
});

export const chemicalReactions = sqliteTable("chemical_reactions", {
  id: text("id").primaryKey(),
  equation: text("equation").notNull(),
  balancedEquation: text("balanced_equation").notNull(),
  type: text("type").notNull(),
  hint: text("hint").notNull(),
  ...timestamps,
});

export const laboratoryExperiments = sqliteTable("laboratory_experiments", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  safety: text("safety").notNull(),
  objective: text("objective").notNull().default(""),
  learningOutcome: text("learning_outcome").notNull().default(""),
  equipment: text("equipment").notNull().default(""),
  reagents: text("reagents").notNull().default(""),
  expectedObservation: text("expected_observation").notNull().default(""),
  equation: text("equation").notNull().default(""),
  explanation: text("explanation").notNull().default(""),
  conclusion: text("conclusion").notNull().default(""),
  visualEffect: text("visual_effect").notNull().default("color"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("published"),
  ...timestamps,
});

export const experimentProgress = sqliteTable("experiment_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  experimentId: text("experiment_id").notNull().references(() => laboratoryExperiments.id),
  currentStep: integer("current_step").notNull().default(0),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  ...timestamps,
}, (table) => [uniqueIndex("experiment_progress_user_exp_uidx").on(table.userId, table.experimentId)]);

export const videoLessons = sqliteTable("video_lessons", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  youtubeVideoId: text("youtube_video_id").notNull(),
  author: text("author").notNull().default("ChemBridge"),
  level: text("level").notNull(),
  courseId: text("course_id").references(() => courses.id),
  topic: text("topic").notNull().default(""),
  durationMinutes: integer("duration_minutes").notNull().default(10),
  difficulty: text("difficulty").notNull().default("Бастапқы"),
  position: integer("position").notNull().default(1),
  status: text("status").notNull().default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
}, (table) => [index("video_lessons_level_status_idx").on(table.level, table.status, table.position)]);

export const syllabuses = sqliteTable("syllabuses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  courseId: text("course_id").references(() => courses.id),
  academicYear: text("academic_year").notNull(),
  semester: text("semester").notNull(),
  language: text("language").notNull().default("Қазақша"),
  author: text("author").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  version: text("version").notNull().default("1.0"),
  status: text("status").notNull().default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
}, (table) => [index("syllabuses_level_status_idx").on(table.level, table.status, table.academicYear)]);

export const presentations = sqliteTable("presentations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  courseId: text("course_id").references(() => courses.id),
  topic: text("topic").notNull().default(""),
  author: text("author").notNull().default("ChemBridge"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  slideCount: integer("slide_count"),
  position: integer("position").notNull().default(1),
  status: text("status").notNull().default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
}, (table) => [index("presentations_level_status_idx").on(table.level, table.status, table.position)]);

export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull().default(""),
  level: text("level").notNull(),
  courseId: text("course_id").references(() => courses.id),
  topic: text("topic").notNull().default(""),
  author: text("author").notNull().default("ChemBridge"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  estimatedMinutes: integer("estimated_minutes"),
  position: integer("position").notNull().default(1),
  status: text("status").notNull().default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
}, (table) => [index("assignments_level_status_idx").on(table.level, table.status, table.position)]);

export const feedbackMessages = sqliteTable("feedback_messages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  relatedPage: text("related_page"),
  status: text("status").notNull().default("new"),
  internalNote: text("internal_note"),
  resolvedBy: text("resolved_by").references(() => users.id),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  ...timestamps,
}, (table) => [
  index("feedback_status_created_idx").on(table.status, table.createdAt),
  index("feedback_user_idx").on(table.userId, table.createdAt),
]);

export const experimentSteps = sqliteTable("experiment_steps", {
  id: text("id").primaryKey(),
  experimentId: text("experiment_id").notNull().references(() => laboratoryExperiments.id),
  instruction: text("instruction").notNull(),
  position: integer("position").notNull(),
});

export const userExperimentResults = sqliteTable("user_experiment_results", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  experimentId: text("experiment_id").notNull().references(() => laboratoryExperiments.id),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [uniqueIndex("experiment_result_user_exp_uidx").on(table.userId, table.experimentId)]);

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  ...timestamps,
});

export const userAchievements = sqliteTable("user_achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  achievementId: text("achievement_id").notNull().references(() => achievements.id),
  awardedAt: integer("awarded_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [uniqueIndex("user_achievement_once_uidx").on(table.userId, table.achievementId)]);

export const userXpTransactions = sqliteTable("user_xp_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  referenceId: text("reference_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [uniqueIndex("xp_transaction_reference_uidx").on(table.userId, table.reason, table.referenceId)]);

export const dailyChallenges = sqliteTable("daily_challenges", {
  id: text("id").primaryKey(),
  challengeDate: text("challenge_date").notNull().unique(),
  title: text("title").notNull(),
  payload: text("payload", { mode: "json" }).notNull(),
  xpReward: integer("xp_reward").notNull().default(35),
  ...timestamps,
});

export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value", { mode: "json" }).notNull(),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  payload: text("payload", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [index("audit_logs_entity_idx").on(table.entityType, table.entityId)]);

export const rateLimitBuckets = sqliteTable("rate_limit_buckets", {
  key: text("key").notNull(),
  bucket: integer("bucket").notNull(),
  count: integer("count").notNull().default(0),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [uniqueIndex("rate_limit_key_bucket_uidx").on(table.key, table.bucket)]);

export const gradeLevels = sqliteTable("grade_levels", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
  status: text("status").notNull().default("published"),
  ...timestamps,
});

export const subjectSections = sqliteTable("subject_sections", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  position: integer("position").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
});

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  status: text("status").notNull().default("draft"),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
}, (table) => [index("pages_status_idx").on(table.status, table.publishedAt)]);

export const pageSections = sqliteTable("page_sections", {
  id: text("id").primaryKey(),
  pageId: text("page_id").notNull().references(() => pages.id),
  sectionKey: text("section_key").notNull(),
  type: text("type").notNull(),
  title: text("title"),
  body: text("body"),
  payload: text("payload", { mode: "json" }),
  position: integer("position").notNull().default(0),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  status: text("status").notNull().default("draft"),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
}, (table) => [
  index("page_sections_page_position_idx").on(table.pageId, table.position),
  uniqueIndex("page_sections_page_key_uidx").on(table.pageId, table.sectionKey),
]);

export const globalTexts = sqliteTable("global_texts", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  locale: text("locale").notNull().default("kk"),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
});

export const navigationItems = sqliteTable("navigation_items", {
  id: text("id").primaryKey(),
  menu: text("menu").notNull().default("main"),
  label: text("label").notNull(),
  href: text("href").notNull(),
  icon: text("icon"),
  position: integer("position").notNull().default(0),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  requiredRole: text("required_role"),
  parentId: text("parent_id"),
  updatedBy: text("updated_by").references(() => users.id),
  ...timestamps,
}, (table) => [index("navigation_menu_position_idx").on(table.menu, table.position)]);

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  altText: text("alt_text").notNull(),
  caption: text("caption"),
  folder: text("folder").notNull().default("general"),
  sizeBytes: integer("size_bytes"),
  uploadedBy: text("uploaded_by").references(() => users.id),
  ...timestamps,
}, (table) => [index("media_assets_folder_idx").on(table.folder, table.createdAt)]);

export const contentVersions = sqliteTable("content_versions", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  version: integer("version").notNull(),
  snapshot: text("snapshot", { mode: "json" }).notNull(),
  changeNote: text("change_note"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("content_versions_entity_version_uidx").on(table.entityType, table.entityId, table.version),
  index("content_versions_entity_idx").on(table.entityType, table.entityId, table.createdAt),
]);
