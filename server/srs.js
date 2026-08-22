// SM-2 spaced repetition scheduling, as used by Anki.
const MIN_EASE_FACTOR = 1.3;

const RATING_QUALITY = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

function applySm2(card, rating) {
  const quality = RATING_QUALITY[rating];
  if (quality === undefined) {
    throw new Error(`Unknown rating: ${rating}`);
  }

  let { easeFactor, intervalDays, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueAt: dueAt.toISOString(),
  };
}

function newCard() {
  return { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };
}

module.exports = { applySm2, newCard };
