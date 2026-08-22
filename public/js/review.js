const reviewArea = document.getElementById("review-area");
const progressFill = document.getElementById("progress-fill");

let cards = [];
let currentIndex = 0;
let revealed = false;

function updateProgress() {
  const pct = cards.length ? Math.round((currentIndex / cards.length) * 100) : 0;
  progressFill.style.width = `${pct}%`;
}

function renderCard() {
  updateProgress();
  const card = cards[currentIndex];
  revealed = false;
  reviewArea.innerHTML = `
    <div class="tigrinya-word">${card.tigrinya}</div>
    <div class="transliteration">${card.transliteration || ""}</div>
    <button id="reveal-btn" style="margin-top: 1rem;">${bilingual("showAnswer")}</button>
    <div id="answer" style="display:none; margin-top: 1rem;">
      <p><strong>${card.english}</strong>
        <button class="tts" title="${STRINGS.hearIt.ti} / ${STRINGS.hearIt.en}">🔊</button>
      </p>
      ${card.example_en ? `<p class="transliteration">${card.example_en}</p>` : ""}
      <div class="rating-row">
        <button data-rating="again">${bilingual("ratingAgain")}</button>
        <button data-rating="hard">${bilingual("ratingHard")}</button>
        <button data-rating="good">${bilingual("ratingGood")}</button>
        <button data-rating="easy">${bilingual("ratingEasy")}</button>
      </div>
    </div>
  `;

  document.getElementById("reveal-btn").addEventListener("click", reveal);
}

function reveal() {
  revealed = true;
  document.getElementById("reveal-btn").style.display = "none";
  const answer = document.getElementById("answer");
  answer.style.display = "block";
  answer
    .querySelector(".tts")
    .addEventListener("click", () => speakEnglish(cards[currentIndex].english));
  answer.querySelectorAll("[data-rating]").forEach((btn) => {
    btn.addEventListener("click", () => submitRating(btn.dataset.rating));
  });
  speakEnglish(cards[currentIndex].english);
}

async function submitRating(rating) {
  const card = cards[currentIndex];
  await apiPost(`/api/review/${card.card_id}`, { rating });
  currentIndex++;
  if (currentIndex >= cards.length) {
    finishReview();
  } else {
    renderCard();
  }
}

function finishReview() {
  progressFill.style.width = "100%";
  reviewArea.innerHTML = `
    <p>${bilingual("reviewComplete")}</p>
    <a href="index.html"><button>${bilingual("backToLessons")}</button></a>
  `;
}

async function init() {
  document.getElementById("back-link").innerHTML = bilingual("backToLessons");
  cards = await apiGet("/api/review/due");
  if (cards.length === 0) {
    reviewArea.innerHTML = `
      <p>${bilingual("noReviewCards")}</p>
      <a href="index.html"><button>${bilingual("backToLessons")}</button></a>
    `;
    return;
  }
  renderCard();
}

init();
