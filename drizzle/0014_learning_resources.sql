CREATE TABLE IF NOT EXISTS presentations (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  course_id TEXT REFERENCES courses(id),
  topic TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'ChemBridge',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  slide_count INTEGER,
  position INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS presentations_level_status_idx ON presentations(level, status, position);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL,
  course_id TEXT REFERENCES courses(id),
  topic TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'ChemBridge',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  estimated_minutes INTEGER,
  position INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS assignments_level_status_idx ON assignments(level, status, position);

INSERT OR IGNORE INTO presentations
  (id, title, description, level, topic, author, file_url, file_name, mime_type, slide_count, position, status, published_at, created_at, updated_at)
VALUES
  ('presentation:sample-atom-structure', 'Атом құрылысы', '7-сыныпқа арналған атом, ядро және электрондар туралы қысқа үлгі презентация.', '7-сынып', 'Атом құрылысы', 'ChemBridge', '/sample-files/atom-kurylysy-ulgisi.pptx', 'atom-kurylysy-ulgisi.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 4, 1, 'published', unixepoch(), unixepoch(), unixepoch());

INSERT OR IGNORE INTO assignments
  (id, title, description, instructions, level, topic, author, file_url, file_name, mime_type, estimated_minutes, position, status, published_at, created_at, updated_at)
VALUES
  ('assignment:sample-atom-practice', 'Атом құрылысы бойынша тапсырмалар', 'Атомдық нөмір, массалық сан және бөлшектер зарядын бекітуге арналған үлгі жұмыс парағы.', 'Тапсырмаларды ретімен орындап, соңында өзін-өзі тексеру өлшемдерін белгілеңіз.', '7-сынып', 'Атом құрылысы', 'ChemBridge', '/sample-files/atom-kurylysy-tapsyrmalar.pdf', 'atom-kurylysy-tapsyrmalar.pdf', 'application/pdf', 20, 1, 'published', unixepoch(), unixepoch(), unixepoch());
