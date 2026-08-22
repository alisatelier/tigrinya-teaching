const express = require("express");
const { db } = require("../db");
const { newCard } = require("../srs");

const router = express.Router();

router.get("/", (req, res) => {
  const lessons = db
    .prepare(
      `SELECT l.id, l.title_en, l.title_ti, l.sort_order,
              COUNT(w.id) AS word_count,
              lp.completed_at
       FROM lessons l
       LEFT JOIN words w ON w.lesson_id = l.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id
       GROUP BY l.id
       ORDER BY l.sort_order`
    )
    .all();
  res.json(lessons);
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
  res.json({ ...lesson, words });
});

router.post("/:id/complete", (req, res) => {
  const lesson = db
    .prepare("SELECT * FROM lessons WHERE id = ?")
    .get(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const words = db
    .prepare("SELECT id FROM words WHERE lesson_id = ?")
    .all(req.params.id);

  const insertCard = db.prepare(
    `INSERT OR IGNORE INTO srs_cards (word_id, ease_factor, interval_days, repetitions, due_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  const markProgress = db.prepare(
    `INSERT INTO lesson_progress (lesson_id, completed_at) VALUES (?, ?)
     ON CONFLICT(lesson_id) DO UPDATE SET completed_at = excluded.completed_at`
  );

  const completeLesson = db.transaction(() => {
    const card = newCard();
    const dueNow = new Date().toISOString();
    for (const word of words) {
      insertCard.run(
        word.id,
        card.easeFactor,
        card.intervalDays,
        card.repetitions,
        dueNow
      );
    }
    markProgress.run(req.params.id, new Date().toISOString());
  });

  completeLesson();
  res.json({ ok: true, enrolledWords: words.length });
});

module.exports = router;
