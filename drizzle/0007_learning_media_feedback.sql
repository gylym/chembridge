ALTER TABLE laboratory_experiments ADD COLUMN objective text NOT NULL DEFAULT '';
ALTER TABLE laboratory_experiments ADD COLUMN learning_outcome text NOT NULL DEFAULT '';
ALTER TABLE laboratory_experiments ADD COLUMN equipment text NOT NULL DEFAULT '';
ALTER TABLE laboratory_experiments ADD COLUMN reagents text NOT NULL DEFAULT '';
ALTER TABLE laboratory_experiments ADD COLUMN expected_observation text NOT NULL DEFAULT '';
ALTER TABLE laboratory_experiments ADD COLUMN equation text NOT NULL DEFAULT '';
ALTER TABLE laboratory_experiments ADD COLUMN explanation text NOT NULL DEFAULT '';
ALTER TABLE laboratory_experiments ADD COLUMN conclusion text NOT NULL DEFAULT '';
ALTER TABLE laboratory_experiments ADD COLUMN visual_effect text NOT NULL DEFAULT 'color';

CREATE TABLE IF NOT EXISTS experiment_progress (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES users(id),
  experiment_id text NOT NULL REFERENCES laboratory_experiments(id),
  current_step integer NOT NULL DEFAULT 0,
  completed_at integer,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch()),
  deleted_at integer
);
CREATE UNIQUE INDEX IF NOT EXISTS experiment_progress_user_exp_uidx ON experiment_progress(user_id, experiment_id);

CREATE TABLE IF NOT EXISTS video_lessons (
  id text PRIMARY KEY NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  youtube_url text NOT NULL,
  youtube_video_id text NOT NULL,
  author text NOT NULL DEFAULT 'ChemBridge',
  level text NOT NULL,
  course_id text REFERENCES courses(id),
  topic text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 10,
  difficulty text NOT NULL DEFAULT 'Бастапқы',
  position integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  published_at integer,
  created_by text REFERENCES users(id),
  updated_by text REFERENCES users(id),
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch()),
  deleted_at integer
);
CREATE UNIQUE INDEX IF NOT EXISTS video_lessons_slug_uidx ON video_lessons(slug);
CREATE INDEX IF NOT EXISTS video_lessons_level_status_idx ON video_lessons(level, status, position);

CREATE TABLE IF NOT EXISTS syllabuses (
  id text PRIMARY KEY NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  level text NOT NULL,
  course_id text REFERENCES courses(id),
  academic_year text NOT NULL,
  semester text NOT NULL,
  language text NOT NULL DEFAULT 'Қазақша',
  author text NOT NULL,
  pdf_url text NOT NULL,
  file_size_bytes integer,
  version text NOT NULL DEFAULT '1.0',
  status text NOT NULL DEFAULT 'draft',
  published_at integer,
  created_by text REFERENCES users(id),
  updated_by text REFERENCES users(id),
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch()),
  deleted_at integer
);
CREATE INDEX IF NOT EXISTS syllabuses_level_status_idx ON syllabuses(level, status, academic_year);

CREATE TABLE IF NOT EXISTS feedback_messages (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES users(id),
  category text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  related_page text,
  status text NOT NULL DEFAULT 'new',
  internal_note text,
  resolved_by text REFERENCES users(id),
  resolved_at integer,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch()),
  deleted_at integer
);
CREATE INDEX IF NOT EXISTS feedback_status_created_idx ON feedback_messages(status, created_at);
CREATE INDEX IF NOT EXISTS feedback_user_idx ON feedback_messages(user_id, created_at);

UPDATE laboratory_experiments
SET objective = CASE WHEN objective = '' THEN description ELSE objective END,
    learning_outcome = CASE WHEN learning_outcome = '' THEN 'Реакция белгісін бақылап, оны химиялық теңдеумен түсіндіру.' ELSE learning_outcome END,
    equipment = CASE WHEN equipment = '' THEN 'Қорғаныш көзілдірігі\nПробирка\nТамшуыр' ELSE equipment END,
    reagents = CASE WHEN reagents = '' THEN 'Виртуалды реактив A\nВиртуалды реактив B' ELSE reagents END,
    expected_observation = CASE WHEN expected_observation = '' THEN description ELSE expected_observation END,
    explanation = CASE WHEN explanation = '' THEN 'Реактив бөлшектері әрекеттесіп, жаңа заттар түзеді.' ELSE explanation END,
    conclusion = CASE WHEN conclusion = '' THEN 'Бақыланған белгі реакция жүргенін көрсетеді.' ELSE conclusion END;
