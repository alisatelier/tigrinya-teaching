const express = require("express");
const { pool } = require("../db");
const asyncHandler = require("../asyncHandler");

const router = express.Router();

router.get(
  "/flagged",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT w.id, w.english, w.tigrinya, w.transliteration,
              w.example_en, w.example_ti, w.example_translit,
              l.id AS lesson_id, l.title_en AS lesson_title_en, l.title_ti AS lesson_title_ti
       FROM words w
       JOIN lessons l ON l.id = w.lesson_id
       WHERE w.needs_review = 1
       ORDER BY l.sort_order, w.id`
    );
    res.json(rows);
  })
);

router.post(
  "/:id/flag",
  asyncHandler(async (req, res) => {
    const { needs_review } = req.body;
    if (typeof needs_review !== "boolean") {
      return res.status(400).json({ error: "needs_review must be a boolean" });
    }
    const { rowCount } = await pool.query("UPDATE words SET needs_review = $1 WHERE id = $2", [
      needs_review ? 1 : 0,
      req.params.id,
    ]);
    if (rowCount === 0) {
      return res.status(404).json({ error: "Word not found" });
    }
    res.json({ ok: true });
  })
);

module.exports = router;
