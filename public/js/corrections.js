const listEl = document.getElementById("corrections-list");

// Mirrors server/routes/words.js SCOPES — each scope pairs a Tigrinya field
// with its transliteration, and English is never part of either.
const SCOPES = {
  word: {
    label: "Word",
    currentText: (w) => w.tigrinya,
    currentTranslit: (w) => w.transliteration,
    correctionText: (w) => w.correction_tigrinya,
    correctionTranslit: (w) => w.correction_transliteration,
  },
  sentence: {
    label: "Sentence",
    currentText: (w) => w.example_ti,
    currentTranslit: (w) => w.example_translit,
    correctionText: (w) => w.correction_example_ti,
    correctionTranslit: (w) => w.correction_example_translit,
  },
};

let currentWords = [];

function escapeAttr(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// A flagged scope "needs input" until someone types an actual correction
// (correctionText is "" rather than null). Words with any scope still
// needing input sort to the top; fully-corrected words sink to the bottom.
function wordNeedsInput(word) {
  return Object.keys(SCOPES).some((key) => {
    const text = SCOPES[key].correctionText(word);
    return text != null && text === "";
  });
}

function wordIsFlagged(word) {
  return Object.keys(SCOPES).some((key) => SCOPES[key].correctionText(word) != null);
}

function expandedScopeHtml(word, scopeKey) {
  const scope = SCOPES[scopeKey];
  return `
    <div class="correction-current">
      <span class="correction-current-label">Current</span>
      <div class="tigrinya-word">${scope.currentText(word)}</div>
      <div class="transliteration">${scope.currentTranslit(word) || ""}</div>
    </div>
    <label class="correction-field">
      <span class="correction-field-label">Corrected to (Tigrinya)</span>
      <input type="text" name="text" value="${escapeAttr(scope.correctionText(word))}" />
    </label>
    <label class="correction-field">
      <span class="correction-field-label">Corrected to (transliteration)</span>
      <input type="text" name="transliteration" value="${escapeAttr(scope.correctionTranslit(word))}" />
    </label>
    <div class="correction-actions">
      <button type="submit">Save</button>
      <button type="button" class="remove-flag">${bilingual("removeFlag")}</button>
    </div>
  `;
}

function collapsedScopeHtml(word, scopeKey) {
  const scope = SCOPES[scopeKey];
  return `
    <button type="button" class="correction-scope-collapsed">
      <span class="correction-scope-collapsed-text">${scope.correctionText(word)}</span>
    </button>
  `;
}

function scopeSection(word, scopeKey) {
  const scope = SCOPES[scopeKey];
  const text = scope.correctionText(word);
  if (text == null) return "";
  const collapsed = text !== "";

  return `
    <div class="correction-scope${collapsed ? " collapsed" : ""}" data-scope="${scopeKey}">
      <div class="correction-scope-label">${scope.label}</div>
      ${collapsed ? collapsedScopeHtml(word, scopeKey) : expandedScopeHtml(word, scopeKey)}
    </div>
  `;
}

function wireScopeSection(section, word) {
  const scopeKey = section.dataset.scope;

  const collapsedBtn = section.querySelector(".correction-scope-collapsed");
  if (collapsedBtn) {
    collapsedBtn.addEventListener("click", () => {
      section.classList.remove("collapsed");
      section.innerHTML = `<div class="correction-scope-label">${SCOPES[scopeKey].label}</div>${expandedScopeHtml(word, scopeKey)}`;
      wireScopeSection(section, word);
    });
    return;
  }

  section.querySelector(".remove-flag").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await apiPost(`/api/words/${word.id}/correction`, { scope: scopeKey, text: null, transliteration: null });
      word.correction_tigrinya = scopeKey === "word" ? null : word.correction_tigrinya;
      word.correction_transliteration = scopeKey === "word" ? null : word.correction_transliteration;
      word.correction_example_ti = scopeKey === "sentence" ? null : word.correction_example_ti;
      word.correction_example_translit = scopeKey === "sentence" ? null : word.correction_example_translit;
      render(currentWords.filter(wordIsFlagged));
    } catch {
      btn.disabled = false;
    }
  });

  const saveBtn = section.querySelector("button[type=submit]");
  section.closest("form")?.addEventListener("submit", async (e) => {
    if (e.submitter !== saveBtn) return;
    e.preventDefault();
    const payload = {
      scope: scopeKey,
      text: section.querySelector("input[name=text]").value,
      transliteration: section.querySelector("input[name=transliteration]").value,
    };
    saveBtn.disabled = true;
    try {
      const updated = await apiPost(`/api/words/${word.id}/correction`, payload);
      Object.assign(word, updated);
      render(currentWords);
    } catch {
      saveBtn.textContent = "Failed to save";
      saveBtn.disabled = false;
      setTimeout(() => {
        saveBtn.textContent = "Save";
      }, 1500);
    }
  });
}

function correctionCard(word) {
  const card = document.createElement("div");
  card.className = "card correction-card";
  card.innerHTML = `
    <div class="correction-lesson"><span class="bi-ti">${word.lesson_title_ti}</span><span class="bi-en">${word.lesson_title_en}</span></div>
    <p class="correction-english"><strong>${word.english}</strong></p>
    <form class="correction-form">
      ${scopeSection(word, "word")}
      ${scopeSection(word, "sentence")}
    </form>
    <div class="correction-actions">
      <a href="lesson.html?id=${word.lesson_id}&section=words"><button type="button" class="secondary">${bilingual("openLesson")}</button></a>
    </div>
  `;

  card.querySelectorAll(".correction-scope").forEach((section) => wireScopeSection(section, word));

  return card;
}

function render(words) {
  currentWords = words;
  listEl.innerHTML = "";
  if (words.length === 0) {
    listEl.innerHTML = `<div class="card"><p>${bilingual("noCorrections")}</p></div>`;
    return;
  }
  const sorted = [...words].sort((a, b) => Number(wordNeedsInput(b)) - Number(wordNeedsInput(a)));
  for (const word of sorted) {
    listEl.appendChild(correctionCard(word));
  }
}

async function init() {
  document.getElementById("corrections-title-primary").textContent = STRINGS.correctionsHeading.ti;
  const words = await apiGet("/api/words/flagged");
  render(words);
}

init();
