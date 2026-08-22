const { Pool } = require("pg");
const { lessons } = require("./seed-data");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_ti TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      ordered INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS words (
      id SERIAL PRIMARY KEY,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id),
      english TEXT NOT NULL,
      tigrinya TEXT NOT NULL,
      transliteration TEXT,
      example_en TEXT,
      example_ti TEXT
    );

    CREATE TABLE IF NOT EXISTS srs_cards (
      id SERIAL PRIMARY KEY,
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

    CREATE TABLE IF NOT EXISTS section_progress (
      lesson_id INTEGER NOT NULL REFERENCES lessons(id),
      section TEXT NOT NULL,
      done_count INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      PRIMARY KEY (lesson_id, section)
    );
  `);
}

async function seedIfEmpty() {
  const {
    rows: [{ count }],
  } = await pool.query("SELECT COUNT(*) AS count FROM lessons");
  if (Number(count) > 0) return;

  for (const lesson of lessons) {
    const {
      rows: [{ id: lessonId }],
    } = await pool.query(
      "INSERT INTO lessons (title_en, title_ti, sort_order, ordered) VALUES ($1, $2, $3, $4) RETURNING id",
      [lesson.title_en, lesson.title_ti, lesson.sort_order, lesson.ordered ? 1 : 0]
    );
    for (const word of lesson.words) {
      await pool.query(
        `INSERT INTO words (lesson_id, english, tigrinya, transliteration, example_en, example_ti)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [lessonId, word.english, word.tigrinya, word.transliteration, word.example_en, word.example_ti]
      );
    }
  }
}

const ready = (async () => {
  await createSchema();
  await seedIfEmpty();
})();

module.exports = { pool, ready };
