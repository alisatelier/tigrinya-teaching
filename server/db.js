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
      example_ti TEXT,
      example_translit TEXT,
      correction_tigrinya TEXT,
      correction_transliteration TEXT,
      correction_example_ti TEXT,
      correction_example_translit TEXT
    );

    CREATE TABLE IF NOT EXISTS srs_cards (
      id SERIAL PRIMARY KEY,
      word_id INTEGER NOT NULL REFERENCES words(id),
      device_id TEXT NOT NULL,
      ease_factor REAL NOT NULL,
      interval_days INTEGER NOT NULL,
      repetitions INTEGER NOT NULL,
      due_at TEXT NOT NULL,
      last_reviewed_at TEXT,
      UNIQUE (word_id, device_id)
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      lesson_id INTEGER NOT NULL REFERENCES lessons(id),
      device_id TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      PRIMARY KEY (lesson_id, device_id)
    );

    CREATE TABLE IF NOT EXISTS section_progress (
      lesson_id INTEGER NOT NULL REFERENCES lessons(id),
      section TEXT NOT NULL,
      device_id TEXT NOT NULL,
      done_count INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      PRIMARY KEY (lesson_id, section, device_id)
    );
  `);
}

// Adds device_id scoping to progress tables that predate the concept (e.g.
// the deployed Neon DB, which so far only ever tracked one shared progress
// per lesson). Pre-existing rows are tagged 'legacy' so they don't collide
// with any real device's data — they're effectively retired, since no
// device will ever send that id. Guarded on column presence so it only
// runs once; skipped entirely on a fresh DB since createSchema already
// creates the device-scoped shape.
async function addDeviceScoping() {
  const {
    rows: [{ exists }],
  } = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'section_progress' AND column_name = 'device_id'
    ) AS exists
  `);
  if (exists) return;

  await pool.query(`
    ALTER TABLE section_progress ADD COLUMN device_id TEXT NOT NULL DEFAULT 'legacy';
    ALTER TABLE section_progress DROP CONSTRAINT section_progress_pkey;
    ALTER TABLE section_progress ADD PRIMARY KEY (lesson_id, section, device_id);

    ALTER TABLE lesson_progress ADD COLUMN device_id TEXT NOT NULL DEFAULT 'legacy';
    ALTER TABLE lesson_progress DROP CONSTRAINT lesson_progress_pkey;
    ALTER TABLE lesson_progress ADD PRIMARY KEY (lesson_id, device_id);

    ALTER TABLE srs_cards ADD COLUMN device_id TEXT NOT NULL DEFAULT 'legacy';
    ALTER TABLE srs_cards DROP CONSTRAINT srs_cards_word_id_key;
    ALTER TABLE srs_cards ADD CONSTRAINT srs_cards_word_id_device_id_key UNIQUE (word_id, device_id);
  `);
}

// Backfill example_translit into rows that predate the column. Matches on
// the Tigrinya word + example sentence (effectively unique) and only fills
// rows still missing the value. Guarded by a single count check so that,
// once every row has been backfilled (true for the live DB already), this
// is one query instead of one round-trip per word — that loop was firing
// ~84 sequential queries against Neon on every cold start.
async function backfillExampleTranslit() {
  const {
    rows: [{ count }],
  } = await pool.query("SELECT COUNT(*) AS count FROM words WHERE example_translit IS NULL");
  if (Number(count) === 0) return;

  for (const lesson of lessons) {
    for (const word of lesson.words) {
      await pool.query(
        `UPDATE words SET example_translit = $1
         WHERE tigrinya = $2 AND example_ti = $3 AND example_translit IS NULL`,
        [word.example_translit, word.tigrinya, word.example_ti]
      );
    }
  }
}

// Additive migrations for databases seeded before these columns existed
// (e.g. the deployed Neon DB). Idempotent.
async function migrate() {
  await pool.query(`
    ALTER TABLE words ADD COLUMN IF NOT EXISTS example_translit TEXT;
    ALTER TABLE words ADD COLUMN IF NOT EXISTS correction_tigrinya TEXT;
    ALTER TABLE words ADD COLUMN IF NOT EXISTS correction_transliteration TEXT;
    ALTER TABLE words ADD COLUMN IF NOT EXISTS correction_example_ti TEXT;
    ALTER TABLE words ADD COLUMN IF NOT EXISTS correction_example_translit TEXT;
    ALTER TABLE words DROP COLUMN IF EXISTS needs_review;
  `);
  await addDeviceScoping();
  await backfillExampleTranslit();
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
        `INSERT INTO words (lesson_id, english, tigrinya, transliteration, example_en, example_ti, example_translit)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [lessonId, word.english, word.tigrinya, word.transliteration, word.example_en, word.example_ti, word.example_translit]
      );
    }
  }
}

const ready = (async () => {
  await createSchema();
  await migrate();
  await seedIfEmpty();
})();

module.exports = { pool, ready };
