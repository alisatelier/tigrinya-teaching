// UI chrome strings (navigation, buttons, headings, instructions) — not the
// lesson vocabulary itself, which lives in server/seed-data.js.
//
// IMPORTANT: like seed-data.js, these Tigrinya strings were drafted by an AI
// assistant without native fluency, then spot-checked against online
// dictionaries where possible. Short app-specific UI labels (ratingAgain,
// ratingHard, next, check, the stage names) are the least reliable of the
// lot — general-purpose phrasebooks rarely cover single-word UI actions like
// "Next" or SRS ratings like "Hard", so those are closer to educated guesses
// than the greeting/family phrases in seed-data.js. Please review and
// correct every entry before relying on the app for real teaching.

const STRINGS = {
  appTitle: { ti: "እንግሊዝኛ ንመሃር", en: "Learn English" },
  lessonsHeading: { ti: "ትምህርትታት", en: "Lessons" },
  loading: { ti: "ይጽዓን ኣሎ...", en: "Loading" },
  backToLessons: { ti: "ናብ ትምህርትታት ተመለስ", en: "Back to lessons" },
  noReviewsDue: { ti: "ሕጂ ዝድገም የለን", en: "No reviews due right now" },
  cardsDue: { ti: "ካርድታት ንምድጋም ተዳልዮም", en: "cards due for review" },
  lessonCompleted: { ti: "ተዛዚሙ", en: "Completed" },
  wordsCount: { ti: "ቃላት", en: "words" },
  sectionWords: { ti: "ቃላት", en: "Words" },
  sectionSentences: { ti: "ሓረጋት", en: "Sentences" },
  sectionQuiz: { ti: "ፈተና", en: "Quiz" },

  reviewHeading: { ti: "ምድጋም", en: "Review" },
  showAnswer: { ti: "መልሲ ርአ", en: "Show answer" },
  ratingAgain: { ti: "ደጊም", en: "Again" },
  ratingHard: { ti: "ከቢድ", en: "Hard" },
  ratingGood: { ti: "ጽቡቕ", en: "Good" },
  ratingEasy: { ti: "ቀሊል", en: "Easy" },
  noReviewCards: { ti: "ሕጂ ዝድገም ካርድ የለን - ጽቡቕ ሰሪሕካ!", en: "No cards are due for review right now — nice work!" },
  reviewComplete: { ti: "ምድጋም ተዛዚሙ!", en: "Review session complete!" },

  stageIntro: { ti: "ቃላት ተመሃር", en: "Learn the words" },
  stagePhrase: { ti: "ኣብ ሓረጋት ርኤ", en: "See them in phrases" },
  stageQuiz: { ti: "ርእስኻ ፈትን", en: "Quiz yourself" },
  showMeaning: { ti: "ትርጉም ርአ", en: "Show meaning" },
  showTranslation: { ti: "ትርጉም ርአ", en: "Show translation" },
  chooseMeaning: { ti: "ትክክለኛ ትርጉም ምረጽ:", en: "Choose the English meaning:" },
  typeTranslation: { ti: "ትርጉም ብእንግሊዝኛ ጽሓፍ:", en: "Type the English translation:" },
  check: { ti: "ኣረጋግጽ", en: "Check" },
  back: { ti: "ንድሕሪት", en: "Back" },
  next: { ti: "ቀጺሉ", en: "Next" },
  finishLesson: { ti: "ትምህርቲ ወድእ", en: "Finish lesson" },
  hearIt: { ti: "ስማዕ", en: "Hear it" },
  correct: { ti: "ልክዕ እዩ!", en: "Correct!" },
  incorrectFeedback: { ti: "ትክክል ኣይኮነን። መልሱ", en: "Not quite — the answer is" },
  lessonCompleteSummary: { ti: "ትምህርቲ ተዛዚሙ!", en: "Lesson complete!" },
};

function bilingual(key) {
  const { ti, en } = STRINGS[key];
  return `<span class="bi-ti">${ti}</span><span class="bi-en">${en}</span>`;
}
