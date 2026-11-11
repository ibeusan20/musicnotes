import {
  DEFAULT_SETTINGS,
  PRACTICE_MODES,
  type PracticeMode,
  type Settings,
} from "./music";
import type { PracticeQuestion } from "./exercises";

import {
  emptySession,
  emptyTotal,
  recordResult,
  type SessionStats,
  type TotalStats,
} from "./statistics";

export interface ModeProfile {
  settings: Settings;
  total: TotalStats;
}

export type ModeProfiles = Record<PracticeMode, ModeProfile>;

export function createDefaultProfiles(): ModeProfiles {
  return Object.fromEntries(
    PRACTICE_MODES.map((mode) => [
      mode,
      {
        settings: { ...DEFAULT_SETTINGS, practiceMode: mode },
        total: emptyTotal(),
      },
    ]),
  ) as ModeProfiles;
}

export interface PracticeState {
  mode: PracticeMode;
  profiles: ModeProfiles;
  legacyTotal: TotalStats | null;
  question: PracticeQuestion;
  session: SessionStats;
  phase: "asking" | "answered";
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
  | {
      type: "switch-mode";
      mode: PracticeMode;
      question: PracticeQuestion;
    }
  | { type: "reset-session"; question: PracticeQuestion }
  | { type: "reset-all"; question: PracticeQuestion };

export function createPracticeState(
  mode: PracticeMode,
  profiles: ModeProfiles,
  legacyTotal: TotalStats | null,
  question: PracticeQuestion,
): PracticeState {
  return {
    mode,
    profiles,
    legacyTotal,
    question,
    session: emptySession(),
    phase: "asking",
    lastCorrect: null,
  };
}

function restart(
  state: PracticeState,
  question: PracticeQuestion,
): PracticeState {
  return {
    ...state,
    question,
    session: emptySession(),
    phase: "asking",
    lastCorrect: null,
  };
}

export function practiceReducer(
  state: PracticeState,
  action: PracticeAction,
): PracticeState {
  switch (action.type) {
    case "submit": {
      // One question may only be scored once.
      if (state.phase !== "asking") return state;

      const current = state.profiles[state.mode];

      const updated = recordResult(
        state.session,
        current.total,
        action.correct,
      );

      return {
        ...state,
        session: updated.session,
        profiles: {
          ...state.profiles,
          [state.mode]: {
            ...current,
            total: updated.total,
          },
        },
        phase: "answered",
        lastCorrect: action.correct,
      };
    }

    case "next":
      if (state.phase !== "answered") return state;

      return {
        ...state,
        question: action.question,
        phase: "asking",
        lastCorrect: null,
      };

    case "change-settings":
      if (action.settings.practiceMode !== state.mode) {
        return state;
      }

      return restart(
        {
          ...state,
          profiles: {
            ...state.profiles,
            [state.mode]: {
              ...state.profiles[state.mode],
              settings: action.settings,
            },
          },
        },
        action.question,
      );

    case "switch-mode":
      return restart({ ...state, mode: action.mode }, action.question);

    case "reset-session":
      return restart(state, action.question);

    case "reset-all":
      return restart(
        {
          ...state,
          profiles: {
            ...state.profiles,
            [state.mode]: {
              ...state.profiles[state.mode],
              total: emptyTotal(),
            },
          },
        },
        action.question,
      );
  }
}
