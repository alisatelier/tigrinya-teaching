const express = require("express");
const { pool } = require("../db");
const { newCard } = require("../srs");
const asyncHandler = require("../asyncHandler");
const requireDeviceId = require("../requireDeviceId");

const router = express.Router();
router.use(requireDeviceId);

const SECTIONS = ["words", "sentences", "quiz"];

async function sectionTotals(lessonId) {
  const {
    rows: [{ word_count }],
  } = await pool.query("SELECT COUNT(*) AS word_count FROM words WHERE lesson_id = $1", [lessonId]);
  const {
    rows: [{ sentence_count }],
  } = await pool.query(
    `SELECT COUNT(*) AS sentence_count FROM words
     WHERE lesson_id = $1 AND example_en IS NOT NULL AND example_ti IS NOT NULL`,
    [lessonId]
  );
  return { words: Number(word_count), sentences: Number(sentence_count), quiz: Number(word_count) };
}

async function sectionsFor(lessonId, deviceId) {
  const totals = await sectionTotals(lessonId);
  const { rows } = await pool.query(
    "SELECT section, done_count, completed_at FROM section_progress WHERE lesson_id = $1 AND device_id = $2",
    [lessonId, deviceId]
  );
  const bySection = Object.fromEntries(rows.map((r) => [r.section, r]));

  const sections = {};
  for (const section of SECTIONS) {
    const row = bySection[section];
    sections[section] = {
      done: row ? row.done_count : 0,
      total: totals[section],
      completed: Boolean(row && row.completed_at),
    };
  }
  return sections;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows: lessonRows } = await pool.query(
      `SELECT id, title_en, title_ti, sort_order
       FROM lessons
       ORDER BY sort_order`
    );
    const withSections = await Promise.all(
      lessonRows.map(async (lesson) => ({
        ...lesson,
        sections: await sectionsFor(lesson.id, req.deviceId),
      }))
    );
    res.json(withSections);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const {
      rows: [lesson],
    } = await pool.query("SELECT * FROM lessons WHERE id = $1", [req.params.id]);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    const { rows: words } = await pool.query("SELECT * FROM words WHERE lesson_id = $1 ORDER BY id", [
      req.params.id,
    ]);
    res.json({ ...lesson, words, sections: await sectionsFor(req.params.id, req.deviceId) });
  })
);

router.post(
  "/:id/progress",
  asyncHandler(async (req, res) => {
    const { section, done } = req.body;
    if (!SECTIONS.includes(section) || !Number.isInteger(done) || done < 0) {
      return res.status(400).json({ error: "Invalid section or done count" });
    }

    const {
      rows: [lesson],
    } = await pool.query("SELECT * FROM lessons WHERE id = $1", [req.params.id]);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const totals = await sectionTotals(req.params.id);
    const total = totals[section];

    const {
      rows: [existing],
    } = await pool.query(
      "SELECT * FROM section_progress WHERE lesson_id = $1 AND section = $2 AND device_id = $3",
      [req.params.id, section, req.deviceId]
    );

    const newDoneCount = Math.max(existing?.done_count || 0, done);
    const justCompleted = newDoneCount >= total && total > 0 && !existing?.completed_at;
    const completedAt =
      existing?.completed_at || (newDoneCount >= total && total > 0 ? new Date().toISOString() : null);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `INSERT INTO section_progress (lesson_id, section, device_id, done_count, completed_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (lesson_id, section, device_id) DO UPDATE SET
           done_count = EXCLUDED.done_count,
           completed_at = EXCLUDED.completed_at`,
        [req.params.id, section, req.deviceId, newDoneCount, completedAt]
      );

      if (section === "words" && justCompleted) {
        const { rows: words } = await client.query("SELECT id FROM words WHERE lesson_id = $1", [
          req.params.id,
        ]);
        const card = newCard();
        const dueNow = new Date().toISOString();
        for (const word of words) {
          await client.query(
            `INSERT INTO srs_cards (word_id, device_id, ease_factor, interval_days, repetitions, due_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (word_id, device_id) DO NOTHING`,
            [word.id, req.deviceId, card.easeFactor, card.intervalDays, card.repetitions, dueNow]
          );
        }
      }

      if (section === "quiz" && justCompleted) {
        await client.query(
          `INSERT INTO lesson_progress (lesson_id, device_id, completed_at) VALUES ($1, $2, $3)
           ON CONFLICT (lesson_id, device_id) DO UPDATE SET completed_at = EXCLUDED.completed_at`,
          [req.params.id, req.deviceId, new Date().toISOString()]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    res.json({ ok: true, sections: await sectionsFor(req.params.id, req.deviceId) });
  })
);

module.exports = router;
