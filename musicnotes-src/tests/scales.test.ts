import { describe, expect, it } from "vitest";
import { CLEFS, DEFAULT_SETTINGS, type Letter } from "../src/domain/music";

import {
  MAJOR_KEYS,
  SCALE_TYPES,
  buildScaleQuestion,
  checkScaleAnswer,
  generateScaleQuestion,
  scaleAnswerLabel,
  type ScaleQuestion,
  MODE_TYPES,
} from "../src/domain/scales";

const BASE: Record<Letter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const SHARPS = ["F", "C", "G", "D", "A", "E", "B"];
const FLATS = ["B", "E", "A", "D", "G", "C", "F"];

const EXPECTED: Record<(typeof SCALE_TYPES)[number], number[]> = {
  major: [2, 2, 1, 2, 2, 2, 1],
  "minor-natural": [2, 1, 2, 2, 1, 2, 2],
  "minor-harmonic": [2, 1, 2, 2, 1, 3, 1],
  "minor-melodic": [2, 1, 2, 2, 2, 2, 1],
};

function semitoneSteps(question: ScaleQuestion): number[] {
  const fifths = MAJOR_KEYS.indexOf(question.keySignature) - 7;

  const pitches = question.notes.map((note) => {
    const order = fifths > 0 ? SHARPS : FLATS;
    const position = order.indexOf(note.letter);

    const signature =
      position >= 0 && position < Math.abs(fifths) ? Math.sign(fifths) : 0;

    const explicit: Record<string, number> = {
      none: signature,
      natural: 0,
      sharp: 1,
      flat: -1,
      "double-sharp": 2,
      "double-flat": -2,
    };

    return note.octave * 12 + BASE[note.letter] + explicit[note.accidental];
  });

  return pitches.slice(1).map((pitch, index) => pitch - pitches[index]);
}

describe("Major and minor scales", () => {
  it("supports 15 key signatures", () => {
    expect(MAJOR_KEYS).toHaveLength(15);
  });

  it("has eight ascending notes", () => {
    const question = buildScaleQuestion("C", "major", "treble");

    expect(question.notes).toHaveLength(8);
    expect(question.tonic).toBe("C");
    expect(question.keySignature).toBe("C");
  });

  it("uses the correct intervals in every key and clef", () => {
    for (const key of MAJOR_KEYS) {
      for (const type of SCALE_TYPES) {
        for (const clef of CLEFS) {
          const question = buildScaleQuestion(key, type, clef);

          expect(semitoneSteps(question)).toEqual(EXPECTED[type]);
        }
      }
    }
  });

  it("shows raised seventh in harmonic minor", () => {
    const question = buildScaleQuestion("C", "minor-harmonic", "treble");

    expect(question.tonic).toBe("a");
    expect(question.notes[6].letter).toBe("G");
    expect(question.notes[6].accidental).toBe("sharp");
  });

  it("shows raised sixth and seventh in melodic minor", () => {
    const question = buildScaleQuestion("C", "minor-melodic", "treble");

    expect(question.notes[5].accidental).toBe("sharp");
    expect(question.notes[6].accidental).toBe("sharp");
  });

  it("uses natural signs where the signature requires them", () => {
    const question = buildScaleQuestion("Cb", "minor-harmonic", "treble");

    expect(question.tonic).toBe("as");
    expect(question.notes[6].accidental).toBe("natural");
  });

  it("supports double sharps where necessary", () => {
    const question = buildScaleQuestion("B", "minor-harmonic", "treble");

    expect(question.tonic).toBe("gis");
    expect(question.notes[6].accidental).toBe("double-sharp");
  });

  it("accepts flexible spelling of answers", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "scales" as const,
      scaleLevel: "all" as const,
    };

    const question = buildScaleQuestion("C", "minor-harmonic", "treble");

    expect(checkScaleAnswer("a mol harmonijski", question, settings)).toBe(
      "correct",
    );

    expect(checkScaleAnswer("a-harmonijski mol", question, settings)).toBe(
      "correct",
    );

    expect(checkScaleAnswer("a prirodni mol", question, settings)).toBe(
      "incorrect",
    );

    expect(checkScaleAnswer("a mol", question, settings)).toBe("invalid");
  });

  it("accepts plain minor in basic practice", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "scales" as const,
      scaleLevel: "basic" as const,
    };

    const question = buildScaleQuestion("C", "minor-natural", "treble");

    expect(checkScaleAnswer("a mol", question, settings)).toBe("correct");
  });

  it("does not immediately repeat the same scale", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "scales" as const,
      scaleLevel: "all" as const,
    };

    const previous = generateScaleQuestion(settings);

    for (let i = 0; i < 50; i++) {
      const next = generateScaleQuestion(settings, previous);

      expect(
        next.type === previous.type &&
          next.keySignature === previous.keySignature &&
          next.clef === previous.clef,
      ).toBe(false);
    }
  });

  it("produces correct answer labels", () => {
    expect(scaleAnswerLabel(buildScaleQuestion("A", "major", "treble"))).toBe(
      "A-dur",
    );

    expect(
      scaleAnswerLabel(buildScaleQuestion("C", "minor-melodic", "treble")),
    ).toBe("a-mol (melodijski)");
  });
});

const MODE_STEPS: Record<(typeof MODE_TYPES)[number], number[]> = {
  ionian: [2, 2, 1, 2, 2, 2, 1],
  dorian: [2, 1, 2, 2, 2, 1, 2],
  phrygian: [1, 2, 2, 2, 1, 2, 2],
  lydian: [2, 2, 2, 1, 2, 2, 1],
  mixolydian: [2, 2, 1, 2, 2, 1, 2],
  aeolian: [2, 1, 2, 2, 1, 2, 2],
  locrian: [1, 2, 2, 1, 2, 2, 2],
};

describe("Diatonic modes", () => {
  it("defines seven modes", () => {
    expect(MODE_TYPES).toHaveLength(7);
  });

  it("generates correct patterns in every key and clef", () => {
    for (const key of MAJOR_KEYS) {
      for (const type of MODE_TYPES) {
        for (const clef of CLEFS) {
          const question = buildScaleQuestion(key, type, clef);

          expect(semitoneSteps(question)).toEqual(MODE_STEPS[type]);
        }
      }
    }
  });

  it("identifies D Dorian from the C major signature", () => {
    const question = buildScaleQuestion("C", "dorian", "treble");

    expect(question.tonic).toBe("D");
    expect(question.keySignature).toBe("C");
    expect(scaleAnswerLabel(question)).toBe("D dorski");
  });

  it("accepts the Croatian mode name", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "modes" as const,
    };

    const question = buildScaleQuestion("C", "lydian", "treble");

    expect(checkScaleAnswer("F lidijski", question, settings)).toBe("correct");

    expect(checkScaleAnswer("F frigijski", question, settings)).toBe(
      "incorrect",
    );
  });

  it("generates only modal questions in mode practice", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "modes" as const,
    };

    for (let i = 0; i < 100; i++) {
      const question = generateScaleQuestion(settings);

      expect(MODE_TYPES.some((type) => type === question.type)).toBe(true);
    }
  });
});


describe("Croatian note name aliases", () => {
  it("accepts b and hes for natural minor", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "scales" as const,
      scaleLevel: "basic" as const,
    };

    const question = buildScaleQuestion(
      "Db",
      "minor-natural",
      "treble",
    );

    expect(checkScaleAnswer("b mol", question, settings))
      .toBe("correct");

    expect(checkScaleAnswer("hes mol", question, settings))
      .toBe("correct");
  });

  it("accepts b and hes for modes", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "modes" as const,
    };

    const question = buildScaleQuestion(
      "Eb",
      "mixolydian",
      "treble",
    );

    expect(
      checkScaleAnswer("B miksolidijski", question, settings),
    ).toBe("correct");

    expect(
      checkScaleAnswer("hes miksolidijski", question, settings),
    ).toBe("correct");
  });
});
