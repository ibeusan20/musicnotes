import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_SETTINGS,
  createNotePool,
  LETTERS,
  type AccidentalType,
  type Letter,
  type Question,
} from "../src/domain/music";

import {
  COMMON_INTERVALS,
  INTERVALS,
  checkIntervalAnswer,
  generateIntervalQuestion,
  identifyInterval,
  type IntervalQuestion,
} from "../src/domain/intervals";

import { generatePracticeQuestion } from "../src/domain/exercises";

const C4: Question = {
  letter: "C",
  octave: 4,
  clef: "treble",
  accidental: "none",
};

function intervalQuestion(
  letter: Letter,
  octave: number,
  accidental: AccidentalType,
): IntervalQuestion {
  return {
    first: C4,
    second: {
      letter,
      octave,
      clef: "treble",
      accidental,
    },
  };
}

function indexOf(note: Question): number {
  return note.octave * 7 + LETTERS.indexOf(note.letter);
}

describe("Interval definitions", () => {
  it("defines 27 unique intervals", () => {
    expect(INTERVALS).toHaveLength(27);

    expect(new Set(INTERVALS.map((interval) => interval.code)).size).toBe(27);
  });

  it("defines 15 common intervals", () => {
    expect(COMMON_INTERVALS.size).toBe(15);

    for (const code of COMMON_INTERVALS) {
      expect(INTERVALS.some((interval) => interval.code === code)).toBe(true);
    }
  });

  it.each([
    ["č1", "C", 4, "none"],
    ["pov1", "C", 4, "sharp"],

    ["sm2", "D", 4, "double-flat"],
    ["m2", "D", 4, "flat"],
    ["v2", "D", 4, "none"],
    ["pov2", "D", 4, "sharp"],

    ["sm3", "E", 4, "double-flat"],
    ["m3", "E", 4, "flat"],
    ["v3", "E", 4, "none"],
    ["pov3", "E", 4, "sharp"],

    ["sm4", "F", 4, "flat"],
    ["č4", "F", 4, "none"],
    ["pov4", "F", 4, "sharp"],

    ["sm5", "G", 4, "flat"],
    ["č5", "G", 4, "none"],
    ["pov5", "G", 4, "sharp"],

    ["sm6", "A", 4, "double-flat"],
    ["m6", "A", 4, "flat"],
    ["v6", "A", 4, "none"],
    ["pov6", "A", 4, "sharp"],

    ["sm7", "B", 4, "double-flat"],
    ["m7", "B", 4, "flat"],
    ["v7", "B", 4, "none"],
    ["pov7", "B", 4, "sharp"],

    ["sm8", "C", 5, "flat"],
    ["č8", "C", 5, "none"],
    ["pov8", "C", 5, "sharp"],
  ] as const)("correctly identifies %s", (code, letter, octave, accidental) => {
    const question = intervalQuestion(letter, octave, accidental);

    expect(identifyInterval(question)).toBe(code);
    expect(checkIntervalAnswer(code, question)).toBe("correct");
  });

  it("distinguishes augmented fourth and diminished fifth", () => {
    const augmentedFourth = intervalQuestion("F", 4, "sharp");
    const diminishedFifth = intervalQuestion("G", 4, "flat");

    expect(identifyInterval(augmentedFourth)).toBe("pov4");
    expect(identifyInterval(diminishedFifth)).toBe("sm5");
    expect(checkIntervalAnswer("sm5", augmentedFourth)).toBe("incorrect");
    expect(checkIntervalAnswer("pov4", diminishedFifth)).toBe("incorrect");
  });

  it("does not classify unsupported compound intervals", () => {
    expect(identifyInterval(intervalQuestion("D", 5, "none"))).toBeNull();
  });
});

describe("Interval answer validation", () => {
  const question = intervalQuestion("G", 4, "none");

  it("accepts the correct answer", () => {
    expect(checkIntervalAnswer("č5", question)).toBe("correct");
    expect(checkIntervalAnswer(" Č 5 ", question)).toBe("correct");
  });

  it("accepts c5 as an ASCII alternative", () => {
    expect(checkIntervalAnswer("c5", question)).toBe("correct");
  });

  it("distinguishes incorrect and invalid answers", () => {
    expect(checkIntervalAnswer("v3", question)).toBe("incorrect");
    expect(checkIntervalAnswer("pov9", question)).toBe("invalid");
    expect(checkIntervalAnswer("", question)).toBe("invalid");
  });
});

describe("Interval generation", () => {
  it("can generate every supported interval", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "intervals" as const,
      intervalLevel: "all" as const,
    };

    const random = vi.spyOn(Math, "random");

    try {
      for (const [index, definition] of INTERVALS.entries()) {
        random
          .mockReturnValueOnce((index + 0.5) / INTERVALS.length)
          .mockReturnValueOnce(0);

        const question = generateIntervalQuestion(settings);

        expect(identifyInterval(question)).toBe(definition.code);
      }
    } finally {
      random.mockRestore();
    }
  });

  it("only generates common intervals in common mode", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      intervalLevel: "common" as const,
    };

    for (let i = 0; i < 100; i++) {
      const question = generateIntervalQuestion(settings);
      const code = identifyInterval(question);

      expect(code).not.toBeNull();
      expect(COMMON_INTERVALS.has(code!)).toBe(true);
    }
  });

  it("keeps both notes in the selected clef and range", () => {
    for (const clef of ["treble", "bass", "alto", "tenor"] as const) {
      for (const difficulty of ["basic", "extended", "advanced"] as const) {
        const settings = {
          ...DEFAULT_SETTINGS,
          clef,
          difficulty,
          intervalLevel: "all" as const,
        };

        const allowed = new Set(
          createNotePool({
            ...settings,
            accidentalLevel: "off",
          }).map(indexOf),
        );

        for (let i = 0; i < 100; i++) {
          const question = generateIntervalQuestion(settings);

          expect(question.first.clef).toBe(clef);
          expect(question.second.clef).toBe(clef);
          expect(allowed.has(indexOf(question.first))).toBe(true);
          expect(allowed.has(indexOf(question.second))).toBe(true);
          expect(identifyInterval(question)).not.toBeNull();
        }
      }
    }
  });

  it("does not repeat the same pair immediately", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      intervalLevel: "all" as const,
    };

    const previous = generateIntervalQuestion(settings);

    for (let i = 0; i < 30; i++) {
      const next = generateIntervalQuestion(settings, previous);

      expect(next).not.toEqual(previous);
    }
  });

  it("uses the correct exercise type", () => {
    const noteExercise = generatePracticeQuestion(DEFAULT_SETTINGS);

    expect(noteExercise.kind).toBe("note");

    const intervalExercise = generatePracticeQuestion({
      ...DEFAULT_SETTINGS,
      practiceMode: "intervals",
    });

    expect(intervalExercise.kind).toBe("interval");

    if (intervalExercise.kind === "interval") {
      expect(identifyInterval(intervalExercise.value)).not.toBeNull();
    }
  });
});
