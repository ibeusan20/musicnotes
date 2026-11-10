import type { Question, Settings } from "./music";

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
  question: Question;
  session: SessionStats;
  total: TotalStats;
  phase: Phase;
  lastCorrect: boolean | null;
}

export type PracticeAction =
  | { type: "submit"; correct: boolean }
  | { type: "next"; question: Question }
  | {
      type: "change-settings";
      settings: Settings;
      question: Question;
    }
  | { type: "reset-session"; question: Question }
  | { type: "reset-all"; question: Question };

// Pure initializer: no browser APIs or randomness.
export function createPracticeState(
  settings: Settings,
  total: TotalStats,
  question: Question,
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
