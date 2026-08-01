import pathlib
import sqlite3

connection = sqlite3.connect(":memory:")
for migration in sorted(pathlib.Path("drizzle").glob("*.sql")):
    connection.executescript(migration.read_text(encoding="utf-8"))

print("counts", connection.execute("SELECT COUNT(*) FROM chemical_elements").fetchone()[0], connection.execute("SELECT COUNT(*) FROM chemical_reactions").fetchone()[0], connection.execute("SELECT COUNT(*) FROM laboratory_experiments").fetchone()[0])
tables = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
required = {"video_lessons", "syllabuses", "presentations", "assignments", "feedback_messages", "experiment_progress"}
print("new_tables", sorted(tables & required))
assert required <= tables
assert connection.execute("SELECT COUNT(*) FROM chemical_elements").fetchone()[0] == 118
