import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";

import MusicStaff from "./components/MusicStaff";
import Scoreboard from "./components/Scoreboard";
import SettingsPanel from "./components/SettingsPanel";

import {
  expectedAnswer,
  generateQuestion,
  type Question,
  type Settings,
} from "./domain/music";

import { checkAnswer } from "./domain/quiz";

import {
  emptySession,
  emptyTotal,
  recordResult,
  type SessionStats,
  type TotalStats,
} from "./domain/statistics";

import { loadStoredData, saveStoredData } from "./lib/storage";

import "./App.css";

type Phase = "asking" | "answered";

interface PracticeState {
  settings: Settings;
  question: Question;
  session: SessionStats;
  total: TotalStats;
  phase: Phase;
  lastCorrect: boolean | null;
}

type Action =
  | {
      type: "submit";
      correct: boolean;
    }
  | {
      type: "next";
      question: Question;
    }
  | {
      type: "change-settings";
      settings: Settings;
      question: Question;
    }
  | {
      type: "reset-session";
      question: Question;
    }
  | {
      type: "reset-all";
      question: Question;
    };

function createInitialState(): PracticeState {
  const saved = loadStoredData();

  return {
    settings: saved.settings,
    question: generateQuestion(saved.settings),
    session: emptySession(),
    total: saved.total,
    phase: "asking",
    lastCorrect: null,
  };
}

function reducer(state: PracticeState, action: Action): PracticeState {
  switch (action.type) {
    case "submit": {
      if (state.phase !== "asking") {
        return state;
      }

      const updated = recordResult(state.session, state.total, action.correct);

      return {
        ...state,
        session: updated.session,
        total: updated.total,
        phase: "answered",
        lastCorrect: action.correct,
      };
    }

    case "next":
      return {
        ...state,
        question: action.question,
        phase: "asking",
        lastCorrect: null,
      };

    case "change-settings":
      return {
        ...state,
        settings: action.settings,
        question: action.question,
        session: emptySession(),
        phase: "asking",
        lastCorrect: null,
      };

    case "reset-session":
      return {
        ...state,
        question: action.question,
        session: emptySession(),
        phase: "asking",
        lastCorrect: null,
      };

    case "reset-all":
      return {
        ...state,
        question: action.question,
        session: emptySession(),
        total: emptyTotal(),
        phase: "asking",
        lastCorrect: null,
      };
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const [answer, setAnswer] = useState("");
  const [inputError, setInputError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Sačuvaj postavke i ukupnu statistiku.
  useEffect(() => {
    saveStoredData(state.settings, state.total);
  }, [state.settings, state.total]);

  // Fokusiraj unos nakon novog pitanja.
  useEffect(() => {
    inputRef.current?.focus();
  }, [state.question]);

  function clearInput() {
    setAnswer("");
    setInputError("");
  }

  function nextQuestion() {
    const question = generateQuestion(state.settings, state.question);

    clearInput();

    dispatch({
      type: "next",
      question,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Kada je odgovor već provjeren,
    // Enter znači sljedeće pitanje.
    if (state.phase === "answered") {
      nextQuestion();
      return;
    }

    const result = checkAnswer(
      answer,
      state.question,
      state.settings.answerMode,
    );

    if (result === "invalid") {
      setInputError(
        state.settings.answerMode === "letter"
          ? "Upiši C, D, E, F, G, A ili H."
          : "Upiši naziv i oktavu, npr. C4 ili H3.",
      );

      return;
    }

    dispatch({
      type: "submit",
      correct: result === "correct",
    });

    setInputError("");
  }

  function handleSettingsChange(settings: Settings) {
    clearInput();

    dispatch({
      type: "change-settings",
      settings,
      question: generateQuestion(settings, state.question),
    });
  }

  function resetSession() {
    clearInput();

    dispatch({
      type: "reset-session",
      question: generateQuestion(state.settings, state.question),
    });
  }

  function resetAll() {
    const confirmed = window.confirm(
      "Želiš li obrisati svu ukupnu statistiku? " +
        "Ova radnja ne može se poništiti.",
    );

    if (!confirmed) return;

    clearInput();

    dispatch({
      type: "reset-all",
      question: generateQuestion(state.settings, state.question),
    });
  }

  const isAnswered = state.phase === "answered";

  const correctAnswer = expectedAnswer(
    state.question,
    state.settings.answerMode,
  );

  const clefName =
    state.question.clef === "treble" ? "Violinski ključ" : "Basovski ključ";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <a className="home-link" href="/">
            ← Natrag
          </a>

          <h1>MusicNotes</h1>

          <p>Nauči prepoznavati note na crtovlju.</p>
        </div>

        <div className="header-tag">Music note trainer</div>
      </header>

      <main>
        <div className="main-grid">
          <section className="panel practice-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">PREPOZNAJ NOTU</span>

                <h2>Koja je ovo nota?</h2>
              </div>

              <span className="clef-tag">{clefName}</span>
            </div>

            <MusicStaff question={state.question} />

            <form className="answer-form" onSubmit={handleSubmit}>
              <label htmlFor="note-answer">Tvoj odgovor</label>

              <div className="answer-row">
                <input
                  id="note-answer"
                  ref={inputRef}
                  type="text"
                  value={answer}
                  readOnly={isAnswered}
                  maxLength={12}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder={
                    state.settings.answerMode === "letter"
                      ? "Npr. C ili H"
                      : "Npr. C4 ili H3"
                  }
                  aria-invalid={Boolean(inputError)}
                  aria-describedby={inputError ? "answer-error" : undefined}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setInputError("");
                  }}
                  onKeyDown={(event) => {
                    if (isAnswered && event.key === "Enter") {
                      event.preventDefault();
                      nextQuestion();
                    }
                  }}
                />

                <button className="button primary" type="submit">
                  {isAnswered ? "Sljedeća nota" : "Provjeri"}
                </button>
              </div>

              {inputError && (
                <p id="answer-error" className="input-error" role="alert">
                  {inputError}
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
                    <strong>Točno!</strong>
                    <span>Odgovor je {correctAnswer}.</span>
                  </>
                ) : (
                  <>
                    <strong>Netočno.</strong>
                    <span>Točan odgovor: {correctAnswer}.</span>
                  </>
                )
              ) : (
                <span>Upiši naziv note i pritisni Enter.</span>
              )}
            </div>

            <p className="keyboard-hint">
              Enter — provjeri odgovor ili prijeđi na sljedeću notu.
            </p>
          </section>

          <div className="sidebar">
            <Scoreboard session={state.session} total={state.total} />

            <SettingsPanel
              settings={state.settings}
              onChange={handleSettingsChange}
            />

            <section className="panel reset-panel">
              <h2>Resetiranje</h2>

              <div className="reset-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={resetSession}>
                  Resetiraj sesiju
                </button>

                <button
                  type="button"
                  className="button danger"
                  onClick={resetAll}>
                  Obriši svu statistiku
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <span>MusicNotes — vježbanje glazbene notacije</span>
        <span>Statistika se sprema lokalno.</span>
      </footer>
    </div>
  );
}
