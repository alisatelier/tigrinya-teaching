async function renderDueBanner() {
  const banner = document.getElementById("due-banner");
  const due = await apiGet("/api/review/due");
  if (due.length === 0) {
    banner.innerHTML = `<div class="due-banner empty">${bilingual("noReviewsDue")}</div>`;
    return;
  }
  const a = document.createElement("a");
  a.href = "review.html";
  a.className = "due-banner";
  a.innerHTML = `<span class="bi-ti">${due.length} ${STRINGS.cardsDue.ti} →</span><span class="bi-en">${due.length} ${STRINGS.cardsDue.en} →</span>`;
  banner.innerHTML = "";
  banner.appendChild(a);
}

function lessonStatus(lesson) {
  if (lesson.completed_at) return bilingual("lessonCompleted");
  return `<span class="bi-ti">${lesson.word_count} ${STRINGS.wordsCount.ti}</span><span class="bi-en">${lesson.word_count} ${STRINGS.wordsCount.en}</span>`;
}

async function renderLessons() {
  document.getElementById("lessons-heading").innerHTML = bilingual("lessonsHeading");

  const list = document.getElementById("lesson-list");
  const lessons = await apiGet("/api/lessons");
  list.innerHTML = "";
  for (const lesson of lessons) {
    const card = document.createElement("div");
    card.className = "card lesson-card";
    card.innerHTML = `
      <div class="titles">
        <div class="primary">${lesson.title_ti}</div>
        <div class="secondary">${lesson.title_en}</div>
      </div>
      <div class="status">${lessonStatus(lesson)}</div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `lesson.html?id=${lesson.id}`;
    });
    list.appendChild(card);
  }
}

renderDueBanner();
renderLessons();
