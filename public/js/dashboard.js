const SECTION_LABEL_KEYS = {
  words: "sectionWords",
  sentences: "sectionSentences",
  quiz: "sectionQuiz",
};

function sectionCard(lesson, sectionKey, { animate }) {
  const info = lesson.sections[sectionKey];
  const a = document.createElement("a");
  a.href = `lesson.html?id=${lesson.id}&section=${sectionKey}`;
  a.className = "card section-card" + (info.completed ? " done" : "") + (animate ? " cascade-in" : "");
  a.innerHTML = `
    <div class="section-title">
      <span class="name">${bilingual(SECTION_LABEL_KEYS[sectionKey])}</span>
      <span class="section-count">${info.done} / ${info.total}</span>
    </div>
    <div class="progress-bar"><div class="progress-bar-fill" style="width: ${info.total ? Math.round((info.done / info.total) * 100) : 0}%"></div></div>
  `;
  return a;
}

function renderTheme(lesson, previouslyUnlocked) {
  const group = document.createElement("div");
  group.className = "theme-group";
  group.innerHTML = `
    <div class="theme-heading">
      <div class="primary">${lesson.title_ti}</div>
      <div class="secondary">${lesson.title_en}</div>
    </div>
  `;

  group.appendChild(sectionCard(lesson, "words", { animate: false }));

  if (lesson.sections.words.completed) {
    group.appendChild(
      sectionCard(lesson, "sentences", { animate: !previouslyUnlocked.sentences })
    );
  }
  if (lesson.sections.sentences.completed) {
    group.appendChild(
      sectionCard(lesson, "quiz", { animate: !previouslyUnlocked.quiz })
    );
  }

  return group;
}

function loadUnlockedState(lessonId) {
  try {
    return JSON.parse(localStorage.getItem(`unlocked-${lessonId}`)) || {};
  } catch {
    return {};
  }
}

function saveUnlockedState(lessonId, lesson) {
  localStorage.setItem(
    `unlocked-${lessonId}`,
    JSON.stringify({
      sentences: lesson.sections.words.completed,
      quiz: lesson.sections.sentences.completed,
    })
  );
}

async function renderCorrectionsBanner() {
  const banner = document.getElementById("corrections-banner");
  const flagged = await apiGet("/api/words/flagged");
  if (flagged.length === 0) {
    banner.innerHTML = "";
    return;
  }
  const a = document.createElement("a");
  a.href = "corrections.html";
  a.className = "corrections-banner";
  a.innerHTML = `<span class="bi-ti">⚑ ${flagged.length} ${STRINGS.correctionsCount.ti} →</span><span class="bi-en">${flagged.length} ${STRINGS.correctionsCount.en} →</span>`;
  banner.innerHTML = "";
  banner.appendChild(a);
}

async function renderLessons() {
  document.getElementById("lessons-heading").innerHTML = bilingual("lessonsHeading");

  const list = document.getElementById("lesson-list");
  const lessons = await apiGet("/api/lessons");
  list.innerHTML = "";
  for (const lesson of lessons) {
    const previouslyUnlocked = loadUnlockedState(lesson.id);
    list.appendChild(renderTheme(lesson, previouslyUnlocked));
    saveUnlockedState(lesson.id, lesson);
  }
}

renderCorrectionsBanner();
renderLessons();
