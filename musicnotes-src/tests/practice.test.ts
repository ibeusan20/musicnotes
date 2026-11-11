import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/domain/music";
import { createPracticeState, practiceReducer } from "../src/domain/practice";
import { emptyTotal } from "../src/domain/statistics";
import type { PracticeQuestion } from "../src/domain/exercises";
import { generatePracticeQuestion } from "../src/domain/exercises";

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
    clef: "bass",
    accidental: "sharp",
  },
};

function initialState() {
  return createPracticeState(DEFAULT_SETTINGS, emptyTotal(), question);
}

describe("Practice state machine", () => {


it("can switch from note to interval practice", () => {
  const initial = initialState();

  const settings = {
    ...DEFAULT_SETTINGS,
    practiceMode: "intervals" as const,
  };

  const interval = generatePracticeQuestion(settings);

  const changed = practiceReducer(initial, {
    type: "change-settings",
    settings,
    question: interval,
  });

  expect(changed.question.kind).toBe("interval");
  expect(changed.phase).toBe("asking");
  expect(changed.session.correct).toBe(0);
  expect(changed.total).toEqual(initial.total);
});

it("scores an interval answer using the existing reducer", () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    practiceMode: "intervals" as const,
  };

  const question = generatePracticeQuestion(settings);

  const initial = createPracticeState(
    settings,
    emptyTotal(),
    question,
  );

  const answered = practiceReducer(initial, {
    type: "submit",
    correct: true,
  });

  expect(answered.session.correct).toBe(1);
  expect(answered.total.correct).toBe(1);
  expect(answered.session.streak).toBe(1);
});


  it("starts with an unanswered question", () => {
    const state = initialState();

    expect(state.phase).toBe("asking");
    expect(state.lastCorrect).toBeNull();
    expect(state.session.correct).toBe(0);
    expect(state.total.correct).toBe(0);
  });

  it("scores a correct answer exactly once", () => {
    const first = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    expect(first.phase).toBe("answered");
    expect(first.lastCorrect).toBe(true);
    expect(first.session.correct).toBe(1);
    expect(first.total.correct).toBe(1);
    expect(first.session.streak).toBe(1);

    const second = practiceReducer(first, {
      type: "submit",
      correct: true,
    });

    expect(second).toBe(first);
    expect(second.total.correct).toBe(1);
  });

  it("does not skip an unanswered question", () => {
    const state = initialState();

    const updated = practiceReducer(state, {
      type: "next",
      question: nextQuestion,
    });

    expect(updated).toBe(state);
  });

  it("advances after an answer and preserves the streak", () => {
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
    expect(next.lastCorrect).toBeNull();
    expect(next.session.streak).toBe(1);
  });

  it("resets the streak after an incorrect answer", () => {
    const first = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    const next = practiceReducer(first, {
      type: "next",
      question: nextQuestion,
    });

    const incorrect = practiceReducer(next, {
      type: "submit",
      correct: false,
    });

    expect(incorrect.session.correct).toBe(1);
    expect(incorrect.session.incorrect).toBe(1);
    expect(incorrect.session.streak).toBe(0);
    expect(incorrect.session.bestStreak).toBe(1);
    expect(incorrect.total.bestStreak).toBe(1);
  });

  it("resets only the session", () => {
    const answered = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    const reset = practiceReducer(answered, {
      type: "reset-session",
      question: nextQuestion,
    });

    expect(reset.session.correct).toBe(0);
    expect(reset.session.streak).toBe(0);
    expect(reset.total.correct).toBe(1);
    expect(reset.question).toEqual(nextQuestion);
    expect(reset.phase).toBe("asking");
  });

  it("preserves totals when changing settings", () => {
    const answered = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    const settings = {
      ...DEFAULT_SETTINGS,
      clef: "alto" as const,
    };

    const updated = practiceReducer(answered, {
      type: "change-settings",
      settings,
      question: nextQuestion,
    });

    expect(updated.settings).toEqual(settings);
    expect(updated.session.correct).toBe(0);
    expect(updated.total.correct).toBe(1);
    expect(updated.phase).toBe("asking");
  });

  it("clears all statistics on full reset", () => {
    const answered = practiceReducer(initialState(), {
      type: "submit",
      correct: true,
    });

    const reset = practiceReducer(answered, {
      type: "reset-all",
      question: nextQuestion,
    });

    expect(reset.session.correct).toBe(0);
    expect(reset.total.correct).toBe(0);
    expect(reset.total.bestStreak).toBe(0);
    expect(reset.phase).toBe("asking");
  });

  it("does not mutate the previous state", () => {
    const original = initialState();

    practiceReducer(original, {
      type: "submit",
      correct: true,
    });

    expect(original.session.correct).toBe(0);
    expect(original.total.correct).toBe(0);
    expect(original.phase).toBe("asking");
  });

  
});
