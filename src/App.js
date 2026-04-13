import { useEffect, useMemo, useState } from "react";
import { LANGUAGE_LABELS, LANGUAGES, TRANSLATIONS } from "./i18n";

const HIRAGANA_DATA = [
  { char: "\u3042", romaji: "a" },
  { char: "\u3044", romaji: "i" },
  { char: "\u3046", romaji: "u" },
  { char: "\u3048", romaji: "e" },
  { char: "\u304A", romaji: "o" },
  { char: "\u304B", romaji: "ka" },
  { char: "\u304D", romaji: "ki" },
  { char: "\u304F", romaji: "ku" },
  { char: "\u3051", romaji: "ke" },
  { char: "\u3053", romaji: "ko" },
  { char: "\u3055", romaji: "sa" },
  { char: "\u3057", romaji: "shi" },
  { char: "\u3059", romaji: "su" },
  { char: "\u305B", romaji: "se" },
  { char: "\u305D", romaji: "so" },
  { char: "\u305F", romaji: "ta" },
  { char: "\u3061", romaji: "chi" },
  { char: "\u3064", romaji: "tsu" },
  { char: "\u3066", romaji: "te" },
  { char: "\u3068", romaji: "to" },
  { char: "\u306A", romaji: "na" },
  { char: "\u306B", romaji: "ni" },
  { char: "\u306C", romaji: "nu" },
  { char: "\u306D", romaji: "ne" },
  { char: "\u306E", romaji: "no" },
  { char: "\u306F", romaji: "ha" },
  { char: "\u3072", romaji: "hi" },
  { char: "\u3075", romaji: "fu" },
  { char: "\u3078", romaji: "he" },
  { char: "\u307B", romaji: "ho" },
  { char: "\u307E", romaji: "ma" },
  { char: "\u307F", romaji: "mi" },
  { char: "\u3080", romaji: "mu" },
  { char: "\u3081", romaji: "me" },
  { char: "\u3082", romaji: "mo" },
  { char: "\u3084", romaji: "ya" },
  { char: "\u3086", romaji: "yu" },
  { char: "\u3088", romaji: "yo" },
  { char: "\u3089", romaji: "ra" },
  { char: "\u308A", romaji: "ri" },
  { char: "\u308B", romaji: "ru" },
  { char: "\u308C", romaji: "re" },
  { char: "\u308D", romaji: "ro" },
  { char: "\u308F", romaji: "wa" },
  { char: "\u3092", romaji: "wo" },
  { char: "\u3093", romaji: "n" }
];

const QUESTION_OPTIONS = [5, 10, 20, "all"];

function shuffleArray(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getPrompt(item, direction) {
  return direction === "charToRomaji" ? item.char : item.romaji;
}

function getAnswer(item, direction) {
  return direction === "charToRomaji" ? item.romaji : item.char;
}

function App() {
  const [language, setLanguage] = useState("en");
  const [mode, setMode] = useState("flashcard");
  const [direction, setDirection] = useState("charToRomaji");
  const [flashcards, setFlashcards] = useState(HIRAGANA_DATA);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [questionCount, setQuestionCount] = useState(10);
  const [testDeck, setTestDeck] = useState([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [answerShown, setAnswerShown] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    setIsFlipped(false);
  }, [flashcardIndex, direction]);

  const currentFlashcard = flashcards[flashcardIndex];
  const currentQuestion = testDeck[testIndex];
  const isTestFinished =
    testStarted && testIndex >= testDeck.length && testDeck.length > 0;

  const testSummary = useMemo(
    () => ({
      total: testDeck.length,
      wrong: wrongAnswers.length
    }),
    [testDeck.length, wrongAnswers.length]
  );

  function handlePreviousFlashcard() {
    setFlashcardIndex((current) =>
      current === 0 ? flashcards.length - 1 : current - 1
    );
  }

  function handleNextFlashcard() {
    setFlashcardIndex((current) =>
      current === flashcards.length - 1 ? 0 : current + 1
    );
  }

  function handleShuffleFlashcards() {
    setFlashcards((current) => shuffleArray(current));
    setFlashcardIndex(0);
    setIsFlipped(false);
  }

  function startTest() {
    const size =
      questionCount === "all" ? HIRAGANA_DATA.length : Number(questionCount);
    const deck = shuffleArray(HIRAGANA_DATA).slice(0, size);

    setTestDeck(deck);
    setTestStarted(true);
    setTestIndex(0);
    setAnswerShown(false);
    setCorrectCount(0);
    setWrongAnswers([]);
  }

  function handleAnswer(result) {
    if (!currentQuestion) {
      return;
    }

    if (result === "correct") {
      setCorrectCount((current) => current + 1);
    } else {
      setWrongAnswers((current) => [...current, currentQuestion]);
    }

    setTestIndex((current) => current + 1);
    setAnswerShown(false);
  }

  function restartTest() {
    setTestStarted(false);
    setTestDeck([]);
    setTestIndex(0);
    setAnswerShown(false);
    setCorrectCount(0);
    setWrongAnswers([]);
  }

  return (
    <div className="app-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <main className="app-card">
        <header className="hero">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </header>

        <div className="toolbar">
          <div className="mode-switch" role="tablist" aria-label={t.studyMode}>
            <button
              type="button"
              className={mode === "flashcard" ? "active" : ""}
              onClick={() => setMode("flashcard")}
            >
              {t.flashcardMode}
            </button>
            <button
              type="button"
              className={mode === "test" ? "active" : ""}
              onClick={() => setMode("test")}
            >
              {t.testMode}
            </button>
          </div>

          <div className="toolbar-controls">
            <label className="direction-toggle">
              <span>{t.prompt}</span>
              <select
                value={direction}
                onChange={(event) => setDirection(event.target.value)}
              >
                <option value="charToRomaji">{t.characterToRomaji}</option>
                <option value="romajiToChar">{t.romajiToCharacter}</option>
              </select>
            </label>

            <label className="direction-toggle">
              <span>{t.language}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {LANGUAGE_LABELS[lang]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {mode === "flashcard" ? (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>{t.flashcardDeck}</h2>
                <p>{t.cardProgress(flashcardIndex + 1, flashcards.length)}</p>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={handleShuffleFlashcards}
              >
                {t.shuffleDeck}
              </button>
            </div>

            <button
              type="button"
              className={`flashcard ${isFlipped ? "flipped" : ""}`}
              onClick={() => setIsFlipped((current) => !current)}
              aria-label={t.flipFlashcard}
            >
              <div className="flashcard-face flashcard-front">
                <span className="face-label">{t.prompt}</span>
                <span className="flashcard-main">
                  {getPrompt(currentFlashcard, direction)}
                </span>
                <span className="hint">{t.clickToFlip}</span>
              </div>
              <div className="flashcard-face flashcard-back">
                <span className="face-label">{t.answer}</span>
                <span className="flashcard-main answer-text">
                  {getAnswer(currentFlashcard, direction)}
                </span>
                <span className="hint">{t.clickToFlipBack}</span>
              </div>
            </button>

            <div className="actions-row">
              <button
                type="button"
                className="secondary-button"
                onClick={handlePreviousFlashcard}
              >
                {t.previous}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleNextFlashcard}
              >
                {t.next}
              </button>
            </div>
          </section>
        ) : (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>{t.selfTest}</h2>
                <p>{t.selfTestDescription}</p>
              </div>
            </div>

            {!testStarted ? (
              <div className="setup-card">
                <label className="stack-field">
                  <span>{t.numberOfQuestions}</span>
                  <select
                    value={questionCount}
                    onChange={(event) =>
                      setQuestionCount(
                        event.target.value === "all"
                          ? "all"
                          : Number(event.target.value)
                      )
                    }
                  >
                    {QUESTION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option === "all" ? t.all46 : option}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className="primary-button wide-button"
                  onClick={startTest}
                >
                  {t.startTest}
                </button>
              </div>
            ) : isTestFinished ? (
              <div className="result-card">
                <p className="result-kicker">{t.testComplete}</p>
                <h3>
                  {correctCount} / {testSummary.total}
                </h3>
                <p>{t.missedCards(testSummary.wrong)}</p>

                {wrongAnswers.length > 0 ? (
                  <div className="wrong-review">
                    <h4>{t.reviewWrongAnswers}</h4>
                    <div className="wrong-list">
                      {wrongAnswers.map((item) => (
                        <div
                          key={`${item.char}-${item.romaji}`}
                          className="wrong-pill"
                        >
                          <span>{item.char}</span>
                          <span>{item.romaji}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="perfect-score">{t.perfectScore}</p>
                )}

                <button
                  type="button"
                  className="primary-button wide-button"
                  onClick={restartTest}
                >
                  {t.restartTest}
                </button>
              </div>
            ) : (
              <div className="test-card">
                <div className="test-progress">
                  <span>{t.questionProgress(testIndex + 1, testDeck.length)}</span>
                  <span>{t.correctSoFar(correctCount)}</span>
                </div>

                <div className="test-prompt">
                  <span className="face-label">{t.prompt}</span>
                  <div className="test-symbol">
                    {getPrompt(currentQuestion, direction)}
                  </div>
                </div>

                {!answerShown ? (
                  <button
                    type="button"
                    className="primary-button wide-button"
                    onClick={() => setAnswerShown(true)}
                  >
                    {t.showAnswer}
                  </button>
                ) : (
                  <div className="answer-panel">
                    <p>
                      {t.answerLabel}:{" "}
                      <strong>{getAnswer(currentQuestion, direction)}</strong>
                    </p>
                    <div className="actions-row">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleAnswer("wrong")}
                      >
                        {t.wrong}
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => handleAnswer("correct")}
                      >
                        {t.correct}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
