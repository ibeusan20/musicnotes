import { describe, expect, it } from "vitest";

import {
  DEFAULT_SETTINGS,
  PRACTICE_MODES,
  type Question,
} from "../src/domain/music";

import {
  checkPracticeAnswer,
  generatePracticeQuestion,
  practiceAnswerLabel,
  practiceQuestionClef,
  type PracticeQuestion,
} from "../src/domain/exercises";

import { buildChordQuestion } from "../src/domain/chords";
import { buildScaleQuestion } from "../src/domain/scales";

const c4: Question = {
  letter: "C",
  octave: 4,
  clef: "treble",
  accidental: "none",
};

describe("Practice exercise routing", () => {
  it("generates questions for every practice mode", () => {
    for (const mode of PRACTICE_MODES) {
      const question = generatePracticeQuestion({
        ...DEFAULT_SETTINGS,
        practiceMode: mode,
      });

      const expectedKind =
        mode === "notes"
          ? "note"
          : mode === "intervals"
            ? "interval"
            : mode === "chords"
              ? "chord"
              : "scale";

      expect(question.kind).toBe(expectedKind);
    }
  });

  it("validates note recognition", () => {
    const question: PracticeQuestion = {
      kind: "note",
      value: c4,
    };

    expect(practiceAnswerLabel(question, DEFAULT_SETTINGS)).toBe("C");
    expect(checkPracticeAnswer("C", question, DEFAULT_SETTINGS)).toBe(
      "correct",
    );

    expect(checkPracticeAnswer("D", question, DEFAULT_SETTINGS)).toBe(
      "incorrect",
    );
  });

  it("validates interval recognition", () => {
    const question: PracticeQuestion = {
      kind: "interval",
      value: {
        first: c4,
        second: { ...c4, letter: "G" },
      },
    };

    expect(practiceAnswerLabel(question, DEFAULT_SETTINGS)).toBe("č5");
    expect(checkPracticeAnswer("č5", question, DEFAULT_SETTINGS)).toBe(
      "correct",
    );

    expect(practiceQuestionClef(question)).toBe("treble");
  });

  it("validates major scale recognition", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "scales" as const,
    };

    const question: PracticeQuestion = {
      kind: "scale",
      value: buildScaleQuestion("C", "major", "bass"),
    };

    expect(practiceAnswerLabel(question, settings)).toBe("C-dur");
    expect(checkPracticeAnswer("C dur", question, settings)).toBe("correct");
    expect(practiceQuestionClef(question)).toBe("bass");
  });

  it("validates diatonic mode recognition", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "modes" as const,
    };

    const question: PracticeQuestion = {
      kind: "scale",
      value: buildScaleQuestion("C", "dorian", "treble"),
    };

    expect(checkPracticeAnswer("D dorski", question, settings)).toBe("correct");
  });

  it("validates chords and their symbols", () => {
    const question: PracticeQuestion = {
      kind: "chord",
      value: buildChordQuestion("major", 0, c4)!,
    };

    expect(practiceAnswerLabel(question, DEFAULT_SETTINGS)).toBe("D53");
    expect(checkPracticeAnswer("D5/3", question, DEFAULT_SETTINGS)).toBe(
      "correct",
    );

    expect(practiceQuestionClef(question)).toBe("treble");
  });
});
