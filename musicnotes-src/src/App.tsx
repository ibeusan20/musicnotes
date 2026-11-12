import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from "react";

import MusicStaff from "./components/MusicStaff";
import Scoreboard from "./components/Scoreboard";
import SettingsPanel from "./components/SettingsPanel";
import { noteLabel, type Clef, type Settings } from "./domain/music";
import { generatePracticeQuestion } from "./domain/exercises";
import {
  checkIntervalAnswer,
  identifyInterval,
  INTERVALS,
} from "./domain/intervals";
import { checkAnswer } from "./domain/quiz";
import { createPracticeState, practiceReducer } from "./domain/practice";
import { loadStoredData, saveStoredData } from "./lib/storage";
import { playNote } from "./lib/audio";
import { checkScaleAnswer, scaleAnswerLabel } from "./domain/scales";

import {
  loadUiPreferences,
  resolveTheme,
  saveUiPreferences,
  type ThemeSetting,
} from "./lib/uiPreferences";

import {
  translations,
  type Language,
  type Translate,
  type TranslationKey,
} from "./i18n/translations";

import { version } from "../package.json";
import "./App.css";
import { PRACTICE_COPY } from "./i18n/practicecopy";

const CLEF_LABELS: Record<Clef, TranslationKey> = {
  treble: "clefTreble",
  bass: "clefBass",
  alto: "clefAlto",
  tenor: "clefTenor",
};

export default function App() {
  const [state, dispatch] = useReducer(practiceReducer, undefined, () => {
    const saved = loadStoredData();

    return createPracticeState(
      saved.mode,
      saved.profiles,
      saved.legacyTotal,
      generatePracticeQuestion(saved.profiles[saved.mode].settings),
    );
  });

  const settings = state.profiles[state.mode].settings;
  const copy = PRACTICE_COPY[state.mode];
  const total = state.profiles[state.mode].total;

  const [ui, setUi] = useState(loadUiPreferences);
  const [answer, setAnswer] = useState("");

  const [inputError, setInputError] = useState<
    | "invalidLetter"
    | "invalidOctave"
    | "invalidInterval"
    | "invalidScale"
    | null
  >(null);

  const [audioError, setAudioError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t: Translate = (key) => translations[ui.language][key];

  const isAnswered = state.phase === "answered";

  const correctAnswer =
    state.question.kind === "scale"
      ? scaleAnswerLabel(state.question.value)
      : state.question.kind === "interval"
        ? (identifyInterval(state.question.value) ?? "")
        : noteLabel(
            state.question.value,
            settings.answerMode === "letter-octave",
          );

  const intervalDetails =
    state.question.kind === "interval"
      ? INTERVALS.find((item) => item.code === correctAnswer)
      : undefined;

  const currentClef =
    state.question.kind === "scale"
      ? state.question.value.clef
      : state.question.kind === "interval"
        ? state.question.value.first.clef
        : state.question.value.clef;

  const clefName = t(CLEF_LABELS[currentClef]);

  // Play the currently displayed note.
  const playCurrentNote = useCallback(() => {
    if (state.question.kind !== "note") return;

    setAudioError(false);

    void playNote(state.question.value).catch(() => {
      setAudioError(true);
    });
  }, [state.question]);

  // Persist quiz settings and all-time statistics.
  useEffect(() => {
    saveStoredData({
      mode: state.mode,
      profiles: state.profiles,
      legacyTotal: state.legacyTotal,
    });
  }, [state.mode, state.profiles, state.legacyTotal]);

  // Persist UI settings and update document language.
  useEffect(() => {
    saveUiPreferences(ui);

    document.documentElement.lang = ui.language;
    document.title = translations[ui.language].documentTitle;
  }, [ui]);

  // Apply the selected theme and follow OS changes.
  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const theme = resolveTheme(ui.theme, media.matches);

      document.documentElement.dataset.theme = theme;

      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", theme === "dark" ? "#0b1220" : "#f5f7fb");
    };

    applyTheme();

    media.addEventListener("change", applyTheme);

    return () => {
      media.removeEventListener("change", applyTheme);
    };
  }, [ui.theme]);

  // Focus the input.
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [state.question]);

  // Press P to play the current note.
  useEffect(() => {
    if (state.question.kind !== "note") return;
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== "p" ||
        event.repeat ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      ) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.matches("textarea, select, input:not(#note-answer)"))
      ) {
        return;
      }

      event.preventDefault();
      playCurrentNote();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playCurrentNote, state.question.kind]);

  function clearInput() {
    setAnswer("");
    setInputError(null);
    setAudioError(false);
  }

  function nextQuestion() {
    const question = generatePracticeQuestion(settings, state.question);

    clearInput();

    dispatch({
      type: "next",
      question,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isAnswered) {
      nextQuestion();
      return;
    }

    const result =
      state.question.kind === "scale"
        ? checkScaleAnswer(answer, state.question.value, settings)
        : state.question.kind === "interval"
          ? checkIntervalAnswer(answer, state.question.value)
          : checkAnswer(answer, state.question.value, settings.answerMode);

    if (result === "invalid") {
      setInputError(
        state.question.kind === "scale"
          ? "invalidScale"
          : state.question.kind === "interval"
            ? "invalidInterval"
            : settings.answerMode === "letter"
              ? "invalidLetter"
              : "invalidOctave",
      );

      return;
    }

    dispatch({
      type: "submit",
      correct: result === "correct",
    });

    setInputError(null);
  }

  function handleSettingsChange(nextSettings: Settings) {
    clearInput();

    if (nextSettings.practiceMode !== state.mode) {
      const mode = nextSettings.practiceMode;

      dispatch({
        type: "switch-mode",
        mode,
        question: generatePracticeQuestion(state.profiles[mode].settings),
      });

      return;
    }

    dispatch({
      type: "change-settings",
      settings: nextSettings,
      question: generatePracticeQuestion(nextSettings, state.question),
    });
  }

  function resetSession() {
    clearInput();

    dispatch({
      type: "reset-session",
      question: generatePracticeQuestion(settings, state.question),
    });
  }

  function resetAll() {
    if (!window.confirm(t("resetConfirm"))) {
      return;
    }

    clearInput();

    dispatch({
      type: "reset-all",
      question: generatePracticeQuestion(settings, state.question),
    });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-intro">
          <a className="home-link" href="/">
            {t("back")}
          </a>

          <h1>MusicNotes</h1>
          {/* <p>{t("subtitle")}</p> */}
        </div>

        <div className="header-controls">
          <label className="header-control mode-control">
            <span>{t("practiceMode")}</span>
            <select
              value={settings.practiceMode}
              onChange={(event) =>
                handleSettingsChange({
                  ...settings,
                  practiceMode: event.target.value as Settings["practiceMode"],
                })
              }>
              <option value="notes">{t("modeNotesShort")}</option>
              <option value="intervals">{t("modeIntervalsShort")}</option>
              <option value="scales">{t("modeScalesShort")}</option>
              <option value="modes">{t("modeModesShort")}</option>
            </select>
          </label>

          <label className="header-control header-control-compact">
            <span>{t("language")}</span>

            <select
              value={ui.language}
              onChange={(event) =>
                setUi((previous) => ({
                  ...previous,
                  language: event.target.value as Language,
                }))
              }>
              <option value="hr">Hrvatski</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="header-control header-control-compact">
            <span>{t("appearance")}</span>

            <select
              value={ui.theme}
              onChange={(event) =>
                setUi((previous) => ({
                  ...previous,
                  theme: event.target.value as ThemeSetting,
                }))
              }>
              <option value="system">{t("themeSystem")}</option>
              <option value="light">{t("themeLight")}</option>
              <option value="dark">{t("themeDark")}</option>
            </select>
          </label>
        </div>
      </header>

      <main>
        <div className="main-grid">
          <section className="panel practice-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{t(copy.heading)}</span>
                <h2>{t(copy.question)}</h2>
              </div>

              <span className="clef-tag">{clefName}</span>
            </div>

            <MusicStaff
              question={state.question}
              ariaLabel={
                `${t("staffDescription")} ${clefName}. ` + t(copy.instruction)
              }
            />

            {state.question.kind === "note" && (
              <div className="audio-controls">
                <button
                  type="button"
                  className="button secondary"
                  onClick={playCurrentNote}
                  aria-keyshortcuts="P">
                  {t("play")}
                </button>

                {audioError && (
                  <p className="input-error" role="alert">
                    {t("audioError")}
                  </p>
                )}
              </div>
            )}

            <form className="answer-form" onSubmit={handleSubmit}>
              <label htmlFor="note-answer">{t("yourAnswer")}</label>

              <div className="answer-row">
                <input
                  id="note-answer"
                  ref={inputRef}
                  type="text"
                  value={answer}
                  maxLength={40}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}

                  placeholder={t(
                    state.mode === "notes" &&
                      settings.answerMode === "letter-octave"
                      ? "placeholderOctave"
                      : copy.placeholder,
                  )}

                  aria-invalid={inputError !== null}
                  aria-describedby={inputError ? "answer-error" : undefined}
                  onChange={(event) => {
                    if (isAnswered) return;

                    setAnswer(event.target.value);
                    setInputError(null);
                  }}
                  onKeyDown={(event) => {
                    if (isAnswered && event.key === "Enter") {
                      event.preventDefault();
                      nextQuestion();
                    }
                  }}
                />

                <button className="button primary" type="submit">
                  {t(
                    isAnswered
                      ? state.mode === "notes"
                        ? "next"
                        : "nextQuestion"
                      : "check",
                  )}
                </button>
              </div>

              {inputError && (
                <p id="answer-error" className="input-error" role="alert">
                  {t(inputError)}
                </p>
              )}
            </form>

            <div
              className={
                "feedback " +
                (isAnswered
                  ? state.lastCorrect
                    ? "feedback-correct"
                    : "feedback-incorrect"
                  : "feedback-neutral")
              }
              role="status"
              aria-live="polite">
              {isAnswered ? (
                state.lastCorrect ? (
                  <>
                    <strong>{t("correctFeedback")}</strong>
                    <span>
                      {t("answerIs")} {correctAnswer}.
                    </span>
                  </>
                ) : (
                  <>
                    <strong>{t("incorrectFeedback")}</strong>
                    <span>
                      {t("correctAnswer")} {correctAnswer}.
                    </span>
                  </>
                )
              ) : (
                <span>{t(copy.waiting)}</span>
              )}
            </div>

            {isAnswered && intervalDetails && (
              <p className="notation-hint">
                {t("intervalStructure")}: {t("diatonicNumber")}{" "}
                {intervalDetails.degree}
                {" · "}
                {intervalDetails.semitones} {t("semitones")}
              </p>
            )}

            <p className="keyboard-hint">{t("keyboardHint")}</p>

            <p className="notation-hint">{t(copy.hint)}</p>
          </section>

          <div className="sidebar">
            <Scoreboard
              session={state.session}
              total={total}
              legacyTotal={state.legacyTotal}
              t={t}
            />

            <SettingsPanel
              settings={settings}
              onChange={handleSettingsChange}
              t={t}
            />

            <section className="panel reset-panel">
              <h2>{t("reset")}</h2>

              <div className="reset-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={resetSession}>
                  {t("resetSession")}
                </button>

                <button
                  type="button"
                  className="button danger"
                  onClick={resetAll}>
                  {t("resetAll")}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <span>v{version}</span>
        <span>·</span>
        <span>{t("footer")}</span>
        <span>·</span>
        <span>{t("storageNotice")}</span>
        <span>·</span>
        <span>© 2026 Ivan Beusan</span>
      </footer>
    </div>
  );
}
