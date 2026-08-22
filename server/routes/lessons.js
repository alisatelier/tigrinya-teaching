const express = require("express");
const { db } = require("../db");
const { newCard } = require("../srs");

const router = express.Router();

const SECTIONS = ["words", "sentences", "quiz"];

function sectionTotals(lessonId) {
  const { wordCount } = db
    .prepare("SELECT COUNT(*) AS wordCount FROM words WHERE lesson_id = ?")
    .get(lessonId);
  const { sentenceCount } = db
    .prepare(
      `SELECT COUNT(*) AS sentenceCount FROM words
       WHERE lesson_id = ? AND example_en IS NOT NULL AND example_ti IS NOT NULL`
    )
    .get(lessonId);
  return { words: wordCount, sentences: sentenceCount, quiz: wordCount };
}

function sectionsFor(lessonId) {
  const totals = sectionTotals(lessonId);
  const rows = db
    .prepare("SELECT section, done_count, completed_at FROM section_progress WHERE lesson_id = ?")
    .all(lessonId);
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

router.get("/", (req, res) => {
  const lessons = db
    .prepare(
      `SELECT l.id, l.title_en, l.title_ti, l.sort_order
       FROM lessons l
       ORDER BY l.sort_order`
    )
    .all();
  const withSections = lessons.map((lesson) => ({
    ...lesson,
    sections: sectionsFor(lesson.id),
  }));
  res.json(withSections);
});

router.get("/:id", (req, res) => {
  const lesson = db
    .prepare("SELECT * FROM lessons WHERE id = ?")
    .get(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }
  const words = db
    .prepare("SELECT * FROM words WHERE lesson_id = ? ORDER BY id")
    .all(req.params.id);
  res.json({ ...lesson, words, sections: sectionsFor(req.params.id) });
});

router.post("/:id/progress", (req, res) => {
  const { section, done } = req.body;
  if (!SECTIONS.includes(section) || !Number.isInteger(done) || done < 0) {
    return res.status(400).json({ error: "Invalid section or done count" });
  }

  const lesson = db
    .prepare("SELECT * FROM lessons WHERE id = ?")
    .get(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const totals = sectionTotals(req.params.id);
  const total = totals[section];

  const existing = db
    .prepare("SELECT * FROM section_progress WHERE lesson_id = ? AND section = ?")
    .get(req.params.id, section);

  const newDoneCount = Math.max(existing?.done_count || 0, done);
  const justCompleted = newDoneCount >= total && total > 0 && !existing?.completed_at;
  const completedAt = existing?.completed_at || (newDoneCount >= total && total > 0 ? new Date().toISOString() : null);

  const upsertSection = db.prepare(
    `INSERT INTO section_progress (lesson_id, section, done_count, completed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(lesson_id, section) DO UPDATE SET
       done_count = excluded.done_count,
       completed_at = excluded.completed_at`
  );

  const applyProgress = db.transaction(() => {
    upsertSection.run(req.params.id, section, newDoneCount, completedAt);

    if (section === "words" && justCompleted) {
      const words = db
        .prepare("SELECT id FROM words WHERE lesson_id = ?")
        .all(req.params.id);
      const insertCard = db.prepare(
        `INSERT OR IGNORE INTO srs_cards (word_id, ease_factor, interval_days, repetitions, due_at)
         VALUES (?, ?, ?, ?, ?)`
      );
      const card = newCard();
      const dueNow = new Date().toISOString();
      for (const word of words) {
        insertCard.run(word.id, card.easeFactor, card.intervalDays, card.repetitions, dueNow);
      }
    }

    if (section === "quiz" && justCompleted) {
      db.prepare(
        `INSERT INTO lesson_progress (lesson_id, completed_at) VALUES (?, ?)
         ON CONFLICT(lesson_id) DO UPDATE SET completed_at = excluded.completed_at`
      ).run(req.params.id, new Date().toISOString());
    }
  });

  applyProgress();
  res.json({ ok: true, sections: sectionsFor(req.params.id) });
});

module.exports = router;
