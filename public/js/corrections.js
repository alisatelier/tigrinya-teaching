const listEl = document.getElementById("corrections-list");

function correctionCard(word) {
  const card = document.createElement("div");
  card.className = "card correction-card";
  card.innerHTML = `
    <div class="correction-lesson"><span class="bi-ti">${word.lesson_title_ti}</span><span class="bi-en">${word.lesson_title_en}</span></div>
    <div class="tigrinya-word">${word.tigrinya}</div>
    <div class="transliteration">${word.transliteration || ""}</div>
    <p><strong>${word.english}</strong></p>
    ${word.example_ti ? `<p class="phrase-text">${word.example_ti}</p><p class="transliteration">${word.example_translit || ""}</p>` : ""}
    <div class="correction-actions">
      <a href="lesson.html?id=${word.lesson_id}&section=words"><button class="secondary">${bilingual("openLesson")}</button></a>
      <button class="remove-flag">${bilingual("removeFlag")}</button>
    </div>
  `;

  card.querySelector(".remove-flag").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await apiPost(`/api/words/${word.id}/flag`, { needs_review: false });
      card.remove();
      if (!listEl.querySelector(".correction-card")) render([]);
    } catch {
      btn.disabled = false;
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
