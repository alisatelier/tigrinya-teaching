const path = require("path");
const Database = require("better-sqlite3");
const { lessons } = require("./seed-data");

const db = new Database(path.join(__dirname, "..", "data", "app.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT NOT NULL,
    title_ti TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    ordered INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id),
    english TEXT NOT NULL,
    tigrinya TEXT NOT NULL,
    transliteration TEXT,
    example_en TEXT,
    example_ti TEXT
  );

  CREATE TABLE IF NOT EXISTS srs_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL UNIQUE REFERENCES words(id),
    ease_factor REAL NOT NULL,
    interval_days INTEGER NOT NULL,
    repetitions INTEGER NOT NULL,
    due_at TEXT NOT NULL,
    last_reviewed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    lesson_id INTEGER PRIMARY KEY REFERENCES lessons(id),
    completed_at TEXT NOT NULL
  );
`);

function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM lessons").get();
  if (count > 0) return;

  const insertLesson = db.prepare(
    "INSERT INTO lessons (title_en, title_ti, sort_order, ordered) VALUES (?, ?, ?, ?)"
  );
  const insertWord = db.prepare(
    `INSERT INTO words (lesson_id, english, tigrinya, transliteration, example_en, example_ti)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const seedAll = db.transaction(() => {
    for (const lesson of lessons) {
      const { lastInsertRowid: lessonId } = insertLesson.run(
        lesson.title_en,
        lesson.title_ti,
        lesson.sort_order,
        lesson.ordered ? 1 : 0
      );
      for (const word of lesson.words) {
        insertWord.run(
          lessonId,
          word.english,
          word.tigrinya,
          word.transliteration,
          word.example_en,
          word.example_ti
        );
      }
    }
  });

  seedAll();
}

seedIfEmpty();

module.exports = { db };
