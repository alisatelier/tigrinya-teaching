# Tigrinya → English Learning App

A simple mobile-friendly web app to teach English to Tigrinya speakers, using
themed lessons that feed a spaced-repetition (SRS) review queue.

## Running it

```
npm install
npm start
```

Then open http://localhost:3000 in a browser. Data is stored in a local
SQLite file at `data/app.db`, created automatically on first run.

## How it works

- **Lessons** (`public/lesson.html`) present vocabulary from one theme
  (e.g. Greetings, Numbers, Family) in three stages: learn each word, see it
  used in an example phrase, then quiz yourself (multiple-choice and typing).
- Finishing a lesson enrolls its words into the **review queue**, scheduled
  with the SM-2 spaced-repetition algorithm (`server/srs.js`) — the same
  algorithm Anki uses.
- **Review** (`public/review.html`) shows due cards; rating each one
  (Again / Hard / Good / Easy) reschedules its next appearance.
- English words/examples can be played aloud using the browser's built-in
  text-to-speech (Web Speech API). Tigrinya audio isn't included — browser
  TTS support for Tigrinya is unreliable, so only the Ge'ez script and a
  transliteration are shown.

## Editing or adding vocabulary and UI text

**Important:** the starter vocabulary in `server/seed-data.js`, and the
bilingual UI text (buttons, headings, instructions) in
`public/js/strings.js`, were both drafted by an AI assistant without
verified Tigrinya fluency. Please review every row/entry for accuracy before
relying on either, and correct or extend as needed.

To edit vocabulary:

1. Open `server/seed-data.js`.
2. Edit the `lessons` array — each lesson has a title and a `words` list
   (`english`, `tigrinya`, `transliteration`, `example_en`, `example_ti`).
3. Delete `data/app.db` and restart the server (`npm start`) to reseed with
   your changes. (This resets all lesson/review progress — there's no
   migration path yet, since this is v1.)

To add a new lesson, add another object to the `lessons` array with its own
`title_en`, `title_ti`, `sort_order`, and `words`.
