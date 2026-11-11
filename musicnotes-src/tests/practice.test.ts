import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/domain/music";
import type { PracticeQuestion } from "../src/domain/exercises";
import {
  createDefaultProfiles,
  createPracticeState,
  practiceReducer,
} from "../src/domain/practice";

const question: PracticeQuestion = {
  kind: "note",
  value: {
    letter: "C",
    octave: 4,
    clef: "treble",
    accidental: "none",
  },
};

const nextQuestion: PracticeQuestion = {
  kind: "note",
  value: {
    letter: "D",
    octave: 4,
    clef: "treble",
    accidental: "none",
  },
};

function initialState() {
  return createPracticeState("notes", createDefaultProfiles(), null, question);
}

describe("Practice state machine", () => {
  it("starts without a scored answer", () => {
    const state = initialState();

    expect(state.phase).toBe("asking");
    expect(state.session.correct).toBe(0);
    expect(state.profiles.notes.total.correct).toBe(0);
  });

  it("scores each question only once", () => {
    const first = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    const second = practiceReducer(first, {
      type: "submit",
      correct: true,
    });

    expect(first.session.correct).toBe(1);
    expect(first.profiles.notes.total.correct).toBe(1);
    expect(second).toBe(first);
  });

  it("does not skip an unanswered question", () => {
    const state = initialState();

    const next = practiceReducer(state, {
      type: "next",
      question: nextQuestion,
    });

    expect(next).toBe(state);
  });

  it("advances after answering", () => {
    const answered = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    const next = practiceReducer(answered, {
      type: "next",
      question: nextQuestion,
    });

    expect(next.question).toEqual(nextQuestion);
    expect(next.phase).toBe("asking");
    expect(next.session.streak).toBe(1);
  });

  it("separates statistics between modes", () => {
    const answered = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    const intervalQuestion: PracticeQuestion = {
      kind: "interval",
      value: {
        first: question.value as Extract<
          PracticeQuestion,
          { kind: "note" }
        >["value"],
        second: {
          letter: "G",
          octave: 4,
          clef: "treble",
          accidental: "none",
        },
      },
    };

    const switched = practiceReducer(answered, {
      type: "switch-mode",
      mode: "intervals",
      question: intervalQuestion,
    });

    const scored = practiceReducer(switched, {
      type: "submit",
      correct: false,
    });

    expect(scored.profiles.notes.total.correct).toBe(1);
    expect(scored.profiles.notes.total.incorrect).toBe(0);
    expect(scored.profiles.intervals.total.correct).toBe(0);
    expect(scored.profiles.intervals.total.incorrect).toBe(1);
    expect(scored.session.correct).toBe(0);
    expect(scored.session.incorrect).toBe(1);
  });

  it("preserves independent settings", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      clef: "bass" as const,
    };

    const changed = practiceReducer(initialState(), {
      type: "change-settings",
      settings,
      question,
    });

    expect(changed.profiles.notes.settings.clef).toBe("bass");
    expect(changed.profiles.intervals.settings.clef).toBe("treble");
  });

  it("resets only the active mode's statistics", () => {
    const answered = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    const reset = practiceReducer(answered, {
      type: "reset-all",
      question,
    });

    expect(reset.profiles.notes.total.correct).toBe(0);
    expect(reset.profiles.intervals.total.correct).toBe(0);
    expect(reset.session.correct).toBe(0);
  });
});
