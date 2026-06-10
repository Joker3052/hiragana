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
const PAGES = ["home", "about", "privacy", "contact"];

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

function getPageFromHash() {
  if (typeof window === "undefined") {
    return "home";
  }

  const hash = window.location.hash.replace("#", "");
  return PAGES.includes(hash) ? hash : "home";
}

function AdSlot() {
  return (
    <aside className="ad-slot" aria-label="Advertisement space">
      <div className="ad-slot-label">Advertisement</div>
      <div className="ad-slot-box">
        Ad space reserved for approved ad units
      </div>
    </aside>
  );
}

function SiteSection({ title, lead, children }) {
  return (
    <section className="info-section">
      <h3>{title}</h3>
      <p className="info-lead">{lead}</p>
      <div className="info-body">{children}</div>
    </section>
  );
}

function App() {
  const [language, setLanguage] = useState("en");
  const [page, setPage] = useState(() => getPageFromHash());
  const [mode, setMode] = useState("flashcard");
  const [direction, setDirection] = useState("charToRomaji");
  const [flashcards, setFlashcards] = useState(HIRAGANA_DATA);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [questionCount, setQuestionCount] = useState(10);
  const [testType, setTestType] = useState("random");
  const [customSelections, setCustomSelections] = useState(
    () => new Set(HIRAGANA_DATA.map((item) => item.romaji))
  );
  const [testDeck, setTestDeck] = useState([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [testDirection, setTestDirection] = useState("charToRomaji");
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
  const customSelectionCount = customSelections.size;
  const canStartCustomTest = customSelectionCount >= 4;
  const isHomePage = page === "home";

  useEffect(() => {
    const syncPage = () => setPage(getPageFromHash());

    window.addEventListener("hashchange", syncPage);
    syncPage();

    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  function getItemKey(item) {
    return item.romaji;
  }

  function navigateTo(nextPage) {
    if (nextPage === "home") {
      window.location.hash = "";
      return;
    }

    window.location.hash = nextPage;
  }

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
    let pool = [];
    let size = 0;

    if (testType === "custom") {
      pool = HIRAGANA_DATA.filter((item) => customSelections.has(getItemKey(item)));
      size = pool.length;
    } else {
      pool = HIRAGANA_DATA;
      size = questionCount === "all" ? pool.length : Number(questionCount);
    }

    if (pool.length < 4 || size === 0) {
      return;
    }

    const directionForTest = direction;
    const selectedItems = shuffleArray(pool).slice(0, size);
    const deck = selectedItems.map((item) => {
      const correctAnswer = getAnswer(item, directionForTest);
      const wrongChoices = shuffleArray(
        pool
          .filter((candidate) => getItemKey(candidate) !== getItemKey(item))
          .map((candidate) => getAnswer(candidate, directionForTest))
      )
        .filter((choice, index, array) => array.indexOf(choice) === index)
        .slice(0, 3);

      return {
        item,
        options: shuffleArray([correctAnswer, ...wrongChoices])
      };
    });

    setTestDeck(deck);
    setTestStarted(true);
    setTestDirection(directionForTest);
    setTestIndex(0);
    setCorrectCount(0);
    setWrongAnswers([]);
  }

  function toggleCustomSelection(itemKey) {
    setCustomSelections((current) => {
      const next = new Set(current);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  }

  function selectAllCustom() {
    setCustomSelections(new Set(HIRAGANA_DATA.map((item) => getItemKey(item))));
  }

  function clearAllCustom() {
    setCustomSelections(new Set());
  }

  function handleAnswer(selectedAnswer) {
    if (!currentQuestion) {
      return;
    }

    const isCorrect =
      selectedAnswer === getAnswer(currentQuestion.item, testDirection);

    if (isCorrect) {
      setCorrectCount((current) => current + 1);
    } else {
      setWrongAnswers((current) => [...current, currentQuestion.item]);
    }

    setTestIndex((current) => current + 1);
  }

  function restartTest() {
    setTestStarted(false);
    setTestDeck([]);
    setTestIndex(0);
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

          <nav className="site-nav" aria-label="Site navigation">
            <button
              type="button"
              className={isHomePage ? "active" : ""}
              onClick={() => navigateTo("home")}
            >
              Home
            </button>
            <button
              type="button"
              className={page === "about" ? "active" : ""}
              onClick={() => navigateTo("about")}
            >
              About
            </button>
            <button
              type="button"
              className={page === "privacy" ? "active" : ""}
              onClick={() => navigateTo("privacy")}
            >
              Privacy
            </button>
            <button
              type="button"
              className={page === "contact" ? "active" : ""}
              onClick={() => navigateTo("contact")}
            >
              Contact
            </button>
          </nav>
        </header>

        {isHomePage ? (
          <>
            <section className="intro-grid" aria-label="Site highlights">
              <SiteSection
                title="46 basic Hiragana"
                lead="Learn the full core set in small chunks, with instant feedback and no account needed."
              >
                Start with the character-to-romaji deck, then switch directions once the sounds feel familiar.
              </SiteSection>
              <SiteSection
                title="Fast self-test"
                lead="Practice in quiz mode and review the cards you missed at the end."
              >
                The test flow is designed for quick practice sessions on mobile or desktop.
              </SiteSection>
              <SiteSection
                title="Built for search and ads"
                lead="The site now includes trust pages and more editorial content, which helps with ad approval."
              >
                This gives the project a stronger foundation before adding monetization later.
              </SiteSection>
            </section>

            <AdSlot />

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
                    <div className="test-type-switch" role="tablist" aria-label={t.testType}>
                      <button
                        type="button"
                        className={testType === "random" ? "active" : ""}
                        onClick={() => setTestType("random")}
                      >
                        {t.randomTest}
                      </button>
                      <button
                        type="button"
                        className={testType === "custom" ? "active" : ""}
                        onClick={() => setTestType("custom")}
                      >
                        {t.customTest}
                      </button>
                    </div>

                    {testType === "random" ? (
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
                    ) : (
                      <div className="custom-picker">
                        <div className="custom-picker-header">
                          <p>{t.customSelection}</p>
                          <span>{t.selectedCount(customSelectionCount, HIRAGANA_DATA.length)}</span>
                        </div>

                        <div className="actions-row">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={selectAllCustom}
                          >
                            {t.selectAll}
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={clearAllCustom}
                          >
                            {t.clearAll}
                          </button>
                        </div>

                        <div className="custom-grid">
                          {HIRAGANA_DATA.map((item) => {
                            const itemKey = getItemKey(item);
                            const selected = customSelections.has(itemKey);

                            return (
                              <button
                                key={itemKey}
                                type="button"
                                className={`custom-pill ${selected ? "selected" : ""}`}
                                onClick={() => toggleCustomSelection(itemKey)}
                              >
                                <span>{item.char}</span>
                                <span>{item.romaji}</span>
                              </button>
                            );
                          })}
                        </div>

                        {!canStartCustomTest ? (
                          <p className="setup-warning">{t.needCustomSelection}</p>
                        ) : null}
                      </div>
                    )}

                    <button
                      type="button"
                      className="primary-button wide-button"
                      onClick={startTest}
                      disabled={testType === "custom" && !canStartCustomTest}
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
                    </div>

                    <div className="test-prompt">
                      <span className="face-label">{t.prompt}</span>
                      <div className="test-symbol">
                        {getPrompt(currentQuestion.item, testDirection)}
                      </div>
                    </div>

                    <div className="answer-options">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={`${currentQuestion.item.char}-${option}`}
                          type="button"
                          className="secondary-button wide-button"
                          onClick={() => handleAnswer(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          <section className="panel static-panel">
            {page === "about" ? (
              <>
                <h2>About this site</h2>
                <p>
                  Hiragana Flashcards is a simple practice tool for beginners who want a
                  fast way to review the 46 basic Hiragana characters.
                </p>
                <p>
                  The site is intentionally lightweight, mobile-friendly, and easy to
                  use without sign-up.
                </p>
              </>
            ) : null}

            {page === "privacy" ? (
              <>
                <h2>Privacy Policy</h2>
                <p>
                  This site may use cookies and similar technologies if advertising
                  services or analytics are enabled in the future.
                </p>
                <p>
                  If ads are added, the site will display a clear privacy policy and any
                  required consent notices according to applicable laws.
                </p>
              </>
            ) : null}

            {page === "contact" ? (
              <>
                <h2>Contact</h2>
                <p>
                  For feedback, bug reports, or business inquiries, please add your
                  preferred contact email here before launch.
                </p>
              </>
            ) : null}

            <button
              type="button"
              className="primary-button"
              onClick={() => navigateTo("home")}
            >
              Back to study
            </button>
          </section>
        )}

        <footer className="site-footer">
          <p>© {new Date().getFullYear()} Hiragana Flashcards</p>
          <div className="footer-links">
            <button type="button" onClick={() => navigateTo("about")}>
              About
            </button>
            <button type="button" onClick={() => navigateTo("privacy")}>
              Privacy
            </button>
            <button type="button" onClick={() => navigateTo("contact")}>
              Contact
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
