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

function escapeAttr(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function scopeSection(word, scopeKey) {
  const scope = SCOPES[scopeKey];
  const flagged = scope.correctionText(word) != null;
  if (!flagged) return "";

  return `
    <div class="correction-scope" data-scope="${scopeKey}">
      <div class="correction-scope-label">${scope.label}</div>
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
    </div>
  `;
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

  card.querySelectorAll(".correction-scope").forEach((section) => {
    const scopeKey = section.dataset.scope;

    section.querySelector(".remove-flag").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        await apiPost(`/api/words/${word.id}/correction`, { scope: scopeKey, text: null, transliteration: null });
        section.remove();
        if (!card.querySelector(".correction-scope")) card.remove();
        if (!listEl.querySelector(".correction-card")) render([]);
      } catch {
        btn.disabled = false;
      }
    });
  });

  card.querySelector(".correction-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const section = e.submitter.closest(".correction-scope");
    const scopeKey = section.dataset.scope;
    const saveBtn = section.querySelector("button[type=submit]");
    const payload = {
      scope: scopeKey,
      text: section.querySelector("input[name=text]").value,
      transliteration: section.querySelector("input[name=transliteration]").value,
    };
    saveBtn.disabled = true;
    try {
      await apiPost(`/api/words/${word.id}/correction`, payload);
      saveBtn.textContent = "Saved ✓";
      setTimeout(() => {
        saveBtn.textContent = "Save";
      }, 1500);
    } catch {
      saveBtn.textContent = "Failed to save";
      setTimeout(() => {
        saveBtn.textContent = "Save";
      }, 1500);
    } finally {
      saveBtn.disabled = false;
    }
  });

  return card;
}

function render(words) {
  listEl.innerHTML = "";
  if (words.length === 0) {
    listEl.innerHTML = `<div class="card"><p>${bilingual("noCorrections")}</p></div>`;
    return;
  }
  for (const word of words) {
    listEl.appendChild(correctionCard(word));
  }
}

async function init() {
  document.getElementById("corrections-title-primary").textContent = STRINGS.correctionsHeading.ti;
  const words = await apiGet("/api/words/flagged");
  render(words);
}

init();
