const lessonId = new URLSearchParams(window.location.search).get("id");
const section = new URLSearchParams(window.location.search).get("section") || "words";
const exerciseArea = document.getElementById("exercise-area");
const stageLabel = document.getElementById("stage-label");
const stepNav = document.getElementById("step-nav");
const introProgressEl = document.getElementById("intro-progress");

const SECTION_STAGE = { words: "intro", sentences: "phrase", quiz: "quiz" };
const STAGE_LABEL_KEYS = {
  intro: "stageIntro",
  phrase: "stagePhrase",
  quiz: "stageQuiz",
};

let lesson = null;
let steps = [];
let currentIndex = 0;
let stepAnswers = [];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildSteps(words) {
  const stage = SECTION_STAGE[section];
  if (stage === "intro") {
    return words.map((w) => ({ stage: "intro", word: w }));
  }
  if (stage === "phrase") {
    return words
      .filter((w) => w.example_en && w.example_ti)
      .map((w) => ({ stage: "phrase", word: w }));
  }
  return words.map((w, i) => ({
    stage: "quiz",
    type: i % 2 === 0 ? "choice" : "typing",
    word: w,
  }));
}

function updateStageLabel() {
  stageLabel.innerHTML = bilingual(STAGE_LABEL_KEYS[steps[currentIndex].stage]);
}

function readCount() {
  const stage = steps[currentIndex].stage;
  if (stage === "quiz") {
    return stepAnswers.filter((a) => a).length;
  }
  return stepAnswers.filter((a) => a?.read).length;
}

function postProgress(done) {
  apiPost(`/api/lessons/${lessonId}/progress`, { section, done }).catch(() => {});
}

function renderSectionProgress() {
  const total = steps.length;
  const done = readCount();
  const complete = done === total;
  introProgressEl.innerHTML = `
    <div class="intro-progress-bar"><div class="intro-progress-fill${complete ? " complete" : ""}" style="width: ${Math.round((done / total) * 100)}%"></div></div>
    <div class="intro-progress-label">${done} / ${total}</div>
  `;
  exerciseArea.classList.toggle("complete", complete);
}

function renderRevealStep({
  word,
  primaryText,
  primaryClass = "tigrinya-word",
  secondaryText,
  revealLabel,
  answerHtml,
  speakText,
}) {
  const alreadyRead = stepAnswers[currentIndex]?.read;
  exerciseArea.innerHTML = `
    <div class="flag-row">${flagButtonHtml(word)}</div>
    <div class="${primaryClass}">${primaryText}</div>
    <div class="transliteration">${secondaryText || ""}</div>
    <button id="reveal-btn" style="margin-top: 1rem; ${alreadyRead ? "display:none;" : ""}">${revealLabel}</button>
    <div id="answer" style="display:${alreadyRead ? "block" : "none"}; margin-top: 1rem;">
      <p>${answerHtml} <button class="tts" title="${STRINGS.hearIt.ti} / ${STRINGS.hearIt.en}">🔊</button></p>
    </div>
  `;

  wireFlagButton(word);

  exerciseArea
    .querySelector(".tts")
    .addEventListener("click", () => speakEnglish(speakText));

  if (!alreadyRead) {
    document.getElementById("reveal-btn").addEventListener("click", () => {
      document.getElementById("reveal-btn").style.display = "none";
      document.getElementById("answer").style.display = "block";
      speakEnglish(speakText);
      stepAnswers[currentIndex] = { type: "read", read: true };
      renderSectionProgress();
      renderStepNav();
      postProgress(readCount());
    });
  }
}

function flagButtonHtml(word) {
  const flagged = Boolean(word.needs_review);
  return `
    <button class="flag-btn${flagged ? " flagged" : ""}" id="flag-btn">
      <span class="flag-icon">⚑</span>
      <span class="flag-text"><span class="bi-ti">${flagged ? STRINGS.flagMarked.ti : STRINGS.flagNeedsCorrection.ti}</span><span class="bi-en">${flagged ? STRINGS.flagMarked.en : STRINGS.flagNeedsCorrection.en}</span></span>
    </button>
  `;
}

function wireFlagButton(word) {
  const btn = document.getElementById("flag-btn");
  btn.addEventListener("click", async () => {
    const next = !word.needs_review;
    btn.disabled = true;
    try {
      await apiPost(`/api/words/${word.id}/flag`, { needs_review: next });
      word.needs_review = next ? 1 : 0;
    } catch {
      // leave state unchanged on failure
    }
    btn.disabled = false;
    btn.outerHTML = flagButtonHtml(word);
    wireFlagButton(word);
  });
}

function renderIntro(word) {
  renderRevealStep({
    word,
    primaryText: word.tigrinya,
    secondaryText: word.transliteration,
    revealLabel: bilingual("showMeaning"),
    answerHtml: `<strong>${word.english}</strong>`,
    speakText: word.english,
  });
}

function renderPhrase(word) {
  renderRevealStep({
    word,
    primaryText: word.example_ti,
    primaryClass: "phrase-text",
    secondaryText: word.example_translit,
    revealLabel: bilingual("showTranslation"),
    answerHtml: word.example_en,
    speakText: word.example_en,
  });
}

function renderChoice(step) {
  const { word } = step;
  const existingAnswer = stepAnswers[currentIndex];
  const options = existingAnswer
    ? existingAnswer.optionIds.map((id) => lesson.words.find((w) => w.id === id))
    : shuffle([
        word,
        ...shuffle(lesson.words.filter((w) => w.id !== word.id)).slice(0, 3),
      ]);

  exerciseArea.innerHTML = `
    <div class="tigrinya-word">${word.tigrinya}</div>
    <div class="transliteration">${word.transliteration || ""}</div>
    <p>${bilingual("chooseMeaning")}</p>
    <div class="choice-list"></div>
    <div class="feedback" id="feedback"></div>
  `;

  const list = exerciseArea.querySelector(".choice-list");
  for (const option of options) {
    const btn = document.createElement("button");
    btn.textContent = option.english;
    if (!existingAnswer) {
      btn.addEventListener("click", () => handleChoice(option, word, options));
    }
    list.appendChild(btn);
  }

  if (existingAnswer) {
    showChoiceResult(list, options, word.id, existingAnswer.chosenId, existingAnswer.correct);
  }
}

function handleChoice(chosen, correctWord, options) {
  const correct = chosen.id === correctWord.id;
  stepAnswers[currentIndex] = {
    type: "choice",
    correct,
    chosenId: chosen.id,
    optionIds: options.map((o) => o.id),
  };
  const list = exerciseArea.querySelector(".choice-list");
  showChoiceResult(list, options, correctWord.id, chosen.id, correct);
  renderSectionProgress();
  renderStepNav();
  postProgress(readCount());
}

function showChoiceResult(list, options, correctId, chosenId, correct) {
  const buttons = [...list.querySelectorAll("button")];
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (options[i].id === correctId) b.classList.add("correct");
    else if (options[i].id === chosenId) b.classList.add("incorrect");
  });
  const feedback = document.getElementById("feedback");
  if (correct) {
    feedback.innerHTML = bilingual("correct");
    feedback.className = "feedback correct";
  } else {
    const correctWord = options.find((o) => o.id === correctId);
    feedback.innerHTML = incorrectFeedbackHtml(correctWord.english);
    feedback.className = "feedback incorrect";
  }
}

function incorrectFeedbackHtml(english) {
  return `<span class="bi-ti">${STRINGS.incorrectFeedback.ti} "${english}" እዩ።</span><span class="bi-en">${STRINGS.incorrectFeedback.en} "${english}"</span>`;
}

function renderTyping(step) {
  const { word } = step;
  const existingAnswer = stepAnswers[currentIndex];
  exerciseArea.innerHTML = `
    <div class="tigrinya-word">${word.tigrinya}
      <button class="tts" title="${STRINGS.hearIt.ti} / ${STRINGS.hearIt.en}">🔊</button>
    </div>
    <div class="transliteration">${word.transliteration || ""}</div>
    <p>${bilingual("typeTranslation")}</p>
    <input type="text" id="typing-input" autocomplete="off" autocapitalize="off" />
    <button id="submit-typing">${bilingual("check")}</button>
    <div class="feedback" id="feedback"></div>
  `;

  exerciseArea
    .querySelector(".tts")
    .addEventListener("click", () => speakEnglish(word.english));

  const input = document.getElementById("typing-input");
  if (existingAnswer) {
    input.value = existingAnswer.value;
    input.disabled = true;
    document.getElementById("submit-typing").disabled = true;
    showTypingResult(existingAnswer.correct, word.english);
  } else {
    const submit = () => handleTyping(input.value, word);
    document.getElementById("submit-typing").addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
    input.focus();
  }
}

function handleTyping(value, word) {
  const normalized = value.trim().toLowerCase();
  const correct = normalized === word.english.trim().toLowerCase();
  document.getElementById("typing-input").disabled = true;
  document.getElementById("submit-typing").disabled = true;
  stepAnswers[currentIndex] = { type: "typing", correct, value };
  showTypingResult(correct, word.english);
  speakEnglish(word.english);
  renderSectionProgress();
  renderStepNav();
  postProgress(readCount());
}

function showTypingResult(correct, english) {
  const feedback = document.getElementById("feedback");
  if (correct) {
    feedback.innerHTML = bilingual("correct");
    feedback.className = "feedback correct";
  } else {
    feedback.innerHTML = incorrectFeedbackHtml(english);
    feedback.className = "feedback incorrect";
  }
}

function goToStep(index) {
  currentIndex = index;
  renderStep();
}

function renderStepNav() {
  const isLastStep = currentIndex === steps.length - 1;
  const complete = readCount() === steps.length;

  const forwardLabel = isLastStep ? bilingual("finishLesson") : "›";
  const forwardClass = [isLastStep ? "" : "step-arrow", isLastStep && complete ? "pulse" : ""]
    .filter(Boolean)
    .join(" ");

  stepNav.innerHTML = `
    <button id="step-back" class="secondary step-arrow" aria-label="${STRINGS.back.en}">‹</button>
    <div class="step-dots"></div>
    <button id="step-forward" class="${forwardClass}" aria-label="${STRINGS[isLastStep ? "finishLesson" : "next"].en}">${forwardLabel}</button>
  `;

  const backBtn = document.getElementById("step-back");
  backBtn.disabled = currentIndex === 0;
  backBtn.addEventListener("click", () => goToStep(currentIndex - 1));

  const dots = stepNav.querySelector(".step-dots");
  let activeChip = null;
  steps.forEach((step, stepIndex) => {
    const word = step.word;
    const chip = document.createElement("button");
    const isActive = stepIndex === currentIndex;
    chip.className = "step-chip" + (isActive ? " active" : "");
    chip.innerHTML = `<span class="chip-ti">${word.tigrinya}</span><span class="chip-en">${word.transliteration || ""}</span>`;
    chip.addEventListener("click", () => goToStep(stepIndex));
    dots.appendChild(chip);
    if (isActive) activeChip = chip;
  });
  activeChip?.scrollIntoView({ inline: "center", block: "nearest" });

  document.getElementById("step-forward").addEventListener("click", () => {
    if (isLastStep) {
      finishSection();
    } else {
      goToStep(currentIndex + 1);
    }
  });
}

function renderStep() {
  updateStageLabel();
  const step = steps[currentIndex];
  if (step.stage === "intro") {
    renderIntro(step.word);
  } else if (step.stage === "phrase") {
    renderPhrase(step.word);
  } else if (step.type === "choice") {
    renderChoice(step);
  } else {
    renderTyping(step);
  }
  renderSectionProgress();
  renderStepNav();
}

async function finishSection() {
  stageLabel.textContent = "";
  stepNav.innerHTML = "";
  introProgressEl.innerHTML = "";
  exerciseArea.classList.remove("complete");
  const quizAnswers = stepAnswers.filter((a) => a && (a.type === "choice" || a.type === "typing"));
  const quizCount = quizAnswers.length;
  const correctCount = quizAnswers.filter((a) => a.correct).length;
  await apiPost(`/api/lessons/${lessonId}/progress`, { section, done: readCount() });

  const summary =
    section === "quiz"
      ? `<p><span class="bi-ti">${STRINGS.lessonCompleteSummary.ti} ${correctCount}/${quizCount} ኣብ ፈተና ልክዕ መሊስካ።</span><span class="bi-en">${STRINGS.lessonCompleteSummary.en} You got ${correctCount} of ${quizCount} right in the quiz.</span></p>`
      : `<p>${bilingual("lessonCompleteSummary")}</p>`;

  const recapItems = steps
    .map((step) => {
      const { word } = step;
      return step.stage === "phrase"
        ? { en: word.example_en, ti: word.example_ti }
        : { en: word.english, ti: word.tigrinya, translit: word.transliteration };
    })
    .map(
      (item, i) => `
      <button class="recap-item" data-index="${i}">
        <span class="recap-en">${item.en}</span>
        <span class="recap-ti" hidden>${item.ti}${item.translit ? ` <span class="transliteration">${item.translit}</span>` : ""}</span>
      </button>
    `
    )
    .join("");

  exerciseArea.innerHTML = `
    ${summary}
    <div class="word-recap">${recapItems}</div>
    <a href="index.html"><button>${bilingual("backToLessons")}</button></a>
  `;

  exerciseArea.querySelectorAll(".recap-item").forEach((item) => {
    item.addEventListener("click", () => {
      item.querySelector(".recap-ti").hidden = !item.querySelector(".recap-ti").hidden;
    });
  });
}

async function init() {
  lesson = await apiGet(`/api/lessons/${lessonId}`);
  document.getElementById("lesson-title-primary").textContent = lesson.title_ti;
  document.getElementById("lesson-title-secondary").textContent = lesson.title_en;
  document.getElementById("back-link").innerHTML = bilingual("backToLessons");
  const words = lesson.ordered ? lesson.words : shuffle(lesson.words);
  steps = buildSteps(words);
  stepAnswers = new Array(steps.length).fill(null);
  renderStep();
}

init();
