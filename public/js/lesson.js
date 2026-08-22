const lessonId = new URLSearchParams(window.location.search).get("id");
const exerciseArea = document.getElementById("exercise-area");
const progressFill = document.getElementById("progress-fill");
const stageLabel = document.getElementById("stage-label");
const stepNav = document.getElementById("step-nav");

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
  const intro = words.map((w) => ({ stage: "intro", word: w }));
  const phrases = words
    .filter((w) => w.example_en && w.example_ti)
    .map((w) => ({ stage: "phrase", word: w }));
  const quiz = words.map((w, i) => ({
    stage: "quiz",
    type: i % 2 === 0 ? "choice" : "typing",
    word: w,
  }));
  return [...intro, ...phrases, ...quiz];
}

function updateProgress() {
  const pct = Math.round((currentIndex / steps.length) * 100);
  progressFill.style.width = `${pct}%`;
}

function updateStageLabel() {
  stageLabel.innerHTML = bilingual(STAGE_LABEL_KEYS[steps[currentIndex].stage]);
}

function renderRevealStep({
  primaryText,
  primaryClass = "tigrinya-word",
  secondaryText,
  revealLabel,
  answerHtml,
  speakText,
}) {
  exerciseArea.innerHTML = `
    <div class="${primaryClass}">${primaryText}</div>
    <div class="transliteration">${secondaryText || ""}</div>
    <button id="reveal-btn" style="margin-top: 1rem;">${revealLabel}</button>
    <div id="answer" style="display:none; margin-top: 1rem;">
      <p>${answerHtml} <button class="tts" title="${STRINGS.hearIt.ti} / ${STRINGS.hearIt.en}">🔊</button></p>
    </div>
  `;

  document.getElementById("reveal-btn").addEventListener("click", () => {
    document.getElementById("reveal-btn").style.display = "none";
    const answer = document.getElementById("answer");
    answer.style.display = "block";
    answer
      .querySelector(".tts")
      .addEventListener("click", () => speakEnglish(speakText));
    speakEnglish(speakText);
  });
}

function renderIntro(word) {
  renderRevealStep({
    primaryText: word.tigrinya,
    secondaryText: word.transliteration,
    revealLabel: bilingual("showMeaning"),
    answerHtml: `<strong>${word.english}</strong>`,
    speakText: word.english,
  });
}

function renderPhrase(word) {
  renderRevealStep({
    primaryText: word.example_ti,
    primaryClass: "phrase-text",
    secondaryText: word.tigrinya,
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
  const stage = steps[currentIndex].stage;
  const stageIndices = steps
    .map((s, i) => i)
    .filter((i) => steps[i].stage === stage);
  const isLastStep = currentIndex === steps.length - 1;

  stepNav.innerHTML = `
    <button id="step-back" class="secondary">${bilingual("back")}</button>
    <div class="step-dots"></div>
    <button id="step-forward">${bilingual(isLastStep ? "finishLesson" : "next")}</button>
  `;

  const backBtn = document.getElementById("step-back");
  backBtn.disabled = currentIndex === 0;
  backBtn.addEventListener("click", () => goToStep(currentIndex - 1));

  const dots = stepNav.querySelector(".step-dots");
  stageIndices.forEach((stepIndex, position) => {
    const dot = document.createElement("button");
    dot.className = "step-dot" + (stepIndex === currentIndex ? " active" : "");
    dot.textContent = position + 1;
    dot.addEventListener("click", () => goToStep(stepIndex));
    dots.appendChild(dot);
  });

  document.getElementById("step-forward").addEventListener("click", () => {
    if (isLastStep) {
      finishLesson();
    } else {
      goToStep(currentIndex + 1);
    }
  });
}

function renderStep() {
  updateProgress();
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
  renderStepNav();
}

async function finishLesson() {
  progressFill.style.width = "100%";
  stageLabel.textContent = "";
  stepNav.innerHTML = "";
  const quizAnswers = stepAnswers.filter((a) => a);
  const quizCount = quizAnswers.length;
  const correctCount = quizAnswers.filter((a) => a.correct).length;
  await apiPost(`/api/lessons/${lessonId}/complete`);
  exerciseArea.innerHTML = `
    <p><span class="bi-ti">${STRINGS.lessonCompleteSummary.ti} ${correctCount}/${quizCount} ኣብ ፈተና ልክዕ መሊስካ።</span><span class="bi-en">${STRINGS.lessonCompleteSummary.en} You got ${correctCount} of ${quizCount} right in the quiz.</span></p>
    <p>${bilingual("wordsAddedToReview")}</p>
    <a href="index.html"><button>${bilingual("backToLessons")}</button></a>
  `;
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
