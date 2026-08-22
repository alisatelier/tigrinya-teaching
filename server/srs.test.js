const assert = require("assert");
const { applySm2, newCard } = require("./srs");

// First review, rated "good": becomes due tomorrow, repetitions=1.
let card = newCard();
let result = applySm2(card, "good");
assert.strictEqual(result.repetitions, 1);
assert.strictEqual(result.intervalDays, 1);

// Second consecutive "good": interval jumps to 6 days.
card = { ...card, ...result };
result = applySm2(card, "good");
assert.strictEqual(result.repetitions, 2);
assert.strictEqual(result.intervalDays, 6);

// "Again" resets repetitions and interval regardless of history.
card = { ...card, ...result };
result = applySm2(card, "again");
assert.strictEqual(result.repetitions, 0);
assert.strictEqual(result.intervalDays, 1);

// Ease factor never drops below the SM-2 floor.
card = { easeFactor: 1.3, intervalDays: 10, repetitions: 3 };
result = applySm2(card, "again");
assert.ok(result.easeFactor >= 1.3);

console.log("srs.js: all checks passed");
