import type { Settings } from "./music";
import type { PracticeQuestion } from "./exercises";

import {
  emptySession,
  emptyTotal,
  recordResult,
  type SessionStats,
  type TotalStats,
} from "./statistics";

export type Phase = "asking" | "answered";

export interface PracticeState {
  settings: Settings;
  question: PracticeQuestion;
  session: SessionStats;
  total: TotalStats;
  phase: Phase;
  lastCorrect: boolean | null;
}

export type PracticeAction =
  | { type: "submit"; correct: boolean }
  | { type: "next"; question: PracticeQuestion }
  | {
      type: "change-settings";
      settings: Settings;
      question: PracticeQuestion;
    }
  | { type: "reset-session"; question: PracticeQuestion }
  | { type: "reset-all"; question: PracticeQuestion };

// Pure initializer: no browser APIs or randomness.
export function createPracticeState(
  settings: Settings,
  total: TotalStats,
  question: PracticeQuestion,
): PracticeState {
  return {
    settings,
    question,
    session: emptySession(),
    total,
    phase: "asking",
    lastCorrect: null,
  };
}

// Pure state transitions.
export function practiceReducer(
  state: PracticeState,
  action: PracticeAction,
): PracticeState {
  switch (action.type) {
    case "submit": {
      // An answered question must never score twice.
      if (state.phase !== "asking") return state;

      const updated = recordResult(state.session, state.total, action.correct);

      return {
        ...state,
        ...updated,
        phase: "answered",
        lastCorrect: action.correct,
      };
    }

    case "next":
      // Only advance after submitting an answer.
      if (state.phase !== "answered") return state;

      return {
        ...state,
        question: action.question,
        phase: "asking",
        lastCorrect: null,
      };

    case "change-settings":
      return createPracticeState(action.settings, state.total, action.question);
    case "reset-session":
      return createPracticeState(state.settings, state.total, action.question);
    case "reset-all":
      return createPracticeState(state.settings, emptyTotal(), action.question);
  }
}
