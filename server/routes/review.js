const express = require("express");
const { db } = require("../db");
const { applySm2 } = require("../srs");

const router = express.Router();

router.get("/due", (req, res) => {
  const cards = db
    .prepare(
      `SELECT sc.id AS card_id, sc.due_at, sc.repetitions,
              w.id AS word_id, w.english, w.tigrinya, w.transliteration,
              w.example_en, w.example_ti
       FROM srs_cards sc
       JOIN words w ON w.id = sc.word_id
       WHERE sc.due_at <= ?
       ORDER BY sc.due_at`
    )
    .all(new Date().toISOString());
  res.json(cards);
});

router.post("/:cardId", (req, res) => {
  const { rating } = req.body;
  const card = db
    .prepare("SELECT * FROM srs_cards WHERE id = ?")
    .get(req.params.cardId);
  if (!card) {
    return res.status(404).json({ error: "Card not found" });
  }

  let updated;
  try {
    updated = applySm2(
      {
        easeFactor: card.ease_factor,
        intervalDays: card.interval_days,
        repetitions: card.repetitions,
      },
      rating
    );
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  db.prepare(
    `UPDATE srs_cards
     SET ease_factor = ?, interval_days = ?, repetitions = ?, due_at = ?, last_reviewed_at = ?
     WHERE id = ?`
  ).run(
    updated.easeFactor,
    updated.intervalDays,
    updated.repetitions,
    updated.dueAt,
    new Date().toISOString(),
    req.params.cardId
  );

  res.json({ ok: true, ...updated });
});

module.exports = router;
