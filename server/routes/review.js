const express = require("express");
const { pool } = require("../db");
const { applySm2 } = require("../srs");
const asyncHandler = require("../asyncHandler");
const requireDeviceId = require("../requireDeviceId");

const router = express.Router();
router.use(requireDeviceId);

router.get(
  "/due",
  asyncHandler(async (req, res) => {
    const { rows: cards } = await pool.query(
      `SELECT sc.id AS card_id, sc.due_at, sc.repetitions,
              w.id AS word_id, w.english, w.tigrinya, w.transliteration,
              w.example_en, w.example_ti
       FROM srs_cards sc
       JOIN words w ON w.id = sc.word_id
       WHERE sc.due_at <= $1 AND sc.device_id = $2
       ORDER BY sc.due_at`,
      [new Date().toISOString(), req.deviceId]
    );
    res.json(cards);
  })
);

router.post(
  "/:cardId",
  asyncHandler(async (req, res) => {
    const { rating } = req.body;
    const {
      rows: [card],
    } = await pool.query("SELECT * FROM srs_cards WHERE id = $1 AND device_id = $2", [
      req.params.cardId,
      req.deviceId,
    ]);
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

    await pool.query(
      `UPDATE srs_cards
       SET ease_factor = $1, interval_days = $2, repetitions = $3, due_at = $4, last_reviewed_at = $5
       WHERE id = $6`,
      [updated.easeFactor, updated.intervalDays, updated.repetitions, updated.dueAt, new Date().toISOString(), req.params.cardId]
    );

    res.json({ ok: true, ...updated });
  })
);

module.exports = router;
