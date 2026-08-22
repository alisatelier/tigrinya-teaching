const express = require("express");
const { pool } = require("../db");
const asyncHandler = require("../asyncHandler");

const router = express.Router();

// A correction is scoped to either the standalone word ("word": tigrinya +
// its transliteration) or the example sentence ("sentence": example_ti +
// its transliteration) — never the English, which is never editable here.
const SCOPES = {
  word: { textColumn: "correction_tigrinya", translitColumn: "correction_transliteration" },
  sentence: { textColumn: "correction_example_ti", translitColumn: "correction_example_translit" },
};

router.get(
  "/flagged",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT w.id, w.english, w.tigrinya, w.transliteration,
              w.example_en, w.example_ti, w.example_translit,
              w.correction_tigrinya, w.correction_transliteration,
              w.correction_example_ti, w.correction_example_translit,
              l.id AS lesson_id, l.title_en AS lesson_title_en, l.title_ti AS lesson_title_ti
       FROM words w
       JOIN lessons l ON l.id = w.lesson_id
       WHERE w.correction_tigrinya IS NOT NULL OR w.correction_example_ti IS NOT NULL
       ORDER BY l.sort_order, w.id`
    );
    res.json(rows);
  })
);

// Sets or clears a correction for one scope. Passing text: null clears both
// fields in that scope (unflags); any string (including "") flags it, with
// the string as the suggested fix so far.
router.post(
  "/:id/correction",
  asyncHandler(async (req, res) => {
    const { scope, text, transliteration } = req.body;
    const cfg = SCOPES[scope];
    if (!cfg) {
      return res.status(400).json({ error: "scope must be 'word' or 'sentence'" });
    }
    if (text !== null && typeof text !== "string") {
      return res.status(400).json({ error: "text must be a string or null" });
    }
    if (transliteration != null && typeof transliteration !== "string") {
      return res.status(400).json({ error: "transliteration must be a string or null" });
    }

    const {
      rows: [word],
    } = await pool.query(
      `UPDATE words SET ${cfg.textColumn} = $1, ${cfg.translitColumn} = $2 WHERE id = $3 RETURNING *`,
      [text === null ? null : text.trim(), transliteration == null ? null : transliteration.trim(), req.params.id]
    );
    if (!word) {
      return res.status(404).json({ error: "Word not found" });
    }
    res.json(word);
  })
);

module.exports = router;
