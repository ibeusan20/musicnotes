import { describe, expect, it, vi } from "vitest";

import {
  CLEFS,
  DEFAULT_SETTINGS,
  LETTERS,
  createNotePool,
  type Question,
} from "../src/domain/music";

import {
  CHORD_TYPES,
  buildChordQuestion,
  checkChordAnswer,
  chordCode,
  generateChordQuestion,
  identifyChord,
} from "../src/domain/chords";

import { generatePracticeQuestion } from "../src/domain/exercises";
import { midiNumber } from "../src/domain/audio";

const C4: Question = {
  letter: "C",
  octave: 4,
  clef: "treble",
  accidental: "none",
};

function indexOf(note: Question): number {
  return note.octave * 7 + LETTERS.indexOf(note.letter);
}

describe("Chord definitions", () => {
  it("defines 4 triads and 7 seventh chords", () => {
    expect(
      CHORD_TYPES.filter((type) => type.semitones.length === 3),
    ).toHaveLength(4);

    expect(
      CHORD_TYPES.filter((type) => type.semitones.length === 4),
    ).toHaveLength(7);
  });

  it("defines 40 distinct chord symbols", () => {
    const codes = CHORD_TYPES.flatMap((definition) =>
      definition.semitones.map((_, inversion) =>
        chordCode(definition.id, inversion),
      ),
    );

    expect(codes).toHaveLength(40);
    expect(new Set(codes).size).toBe(40);
  });

  it.each([
    ["major", 0, "D53"],
    ["major", 1, "D6"],
    ["major", 2, "D64"],
    ["minor", 0, "M53"],
    ["diminished", 0, "S53"],
    ["augmented", 0, "P53"],
    ["dominant", 0, "D7"],
    ["dominant", 1, "D65"],
    ["dominant", 2, "D43"],
    ["dominant", 3, "D2"],
    ["major-seventh", 0, "VD7"],
    ["minor-seventh", 0, "MM7"],
    ["minor-major-seventh", 0, "VM7"],
    ["half-diminished", 0, "MS7"],
    ["diminished-seventh", 0, "S7"],
    ["augmented-seventh", 0, "P7"],
  ] as const)(
    "uses the expected symbol for %s inversion %s",
    (type, inversion, code) => {
      expect(chordCode(type, inversion)).toBe(code);
    },
  );
});

describe("Written chord identification", () => {
  it("recognizes every chord and inversion in all four clefs", () => {
    for (const definition of CHORD_TYPES) {
      for (
        let inversion = 0;
        inversion < definition.semitones.length;
        inversion++
      ) {
        for (const clef of CLEFS) {
          const question = buildChordQuestion(definition.id, inversion, {
            ...C4,
            clef,
          });

          expect(question).not.toBeNull();

          expect(identifyChord(question!)).toBe(
            chordCode(definition.id, inversion),
          );
        }
      }
    }
  });

  it("correctly constructs major chord inversions", () => {
    const first = buildChordQuestion("major", 1, C4)!;
    const second = buildChordQuestion("major", 2, C4)!;

    expect(first.notes.map((note) => `${note.letter}${note.octave}`)).toEqual([
      "E4",
      "G4",
      "C5",
    ]);

    expect(second.notes.map((note) => `${note.letter}${note.octave}`)).toEqual([
      "G4",
      "C5",
      "E5",
    ]);
  });

  it("writes diminished sevenths with correct accidentals", () => {
    const question = buildChordQuestion("diminished-seventh", 0, C4)!;

    expect(
      question.notes.map((note) => [note.letter, note.accidental]),
    ).toEqual([
      ["C", "none"],
      ["E", "flat"],
      ["G", "flat"],
      ["B", "double-flat"],
    ]);

    expect(identifyChord(question)).toBe("S7");
  });

  it("distinguishes enharmonic spelling", () => {
    const augmented = buildChordQuestion("augmented", 0, C4)!;

    const changed = {
      ...augmented,
      notes: augmented.notes.map((note, index) =>
        index === 2
          ? { ...note, letter: "A" as const, accidental: "flat" as const }
          : note,
      ),
    };

    expect(identifyChord(augmented)).toBe("P53");
    expect(identifyChord(changed)).toBe("P6");
  });

  it("does not require unsupported triple accidentals", () => {
    const question = buildChordQuestion("diminished-seventh", 0, {
      ...C4,
      accidental: "flat",
    });

    expect(question).toBeNull();
  });
});

describe("Chord answer validation", () => {
  const major = buildChordQuestion("major", 0, C4)!;

  it.each(["D53", "d53", "D5/3", "D⁵₃", "D 5 3"])(
    "accepts equivalent major-triad notation: %s",
    (answer) => {
      expect(checkChordAnswer(answer, major)).toBe("correct");
    },
  );

  it("accepts abbreviated and extended inversion figures", () => {
    const first = buildChordQuestion("major", 1, C4)!;
    const second = buildChordQuestion("dominant", 3, C4)!;

    expect(checkChordAnswer("D6/3", first)).toBe("correct");
    expect(checkChordAnswer("D4/2", second)).toBe("correct");
  });

  it("accepts Croatian alternative abbreviations", () => {
    const diminished = buildChordQuestion("diminished", 0, C4)!;
    const augmented = buildChordQuestion("augmented", 0, C4)!;
    const dominant = buildChordQuestion("dominant", 0, C4)!;

    expect(checkChordAnswer("Sm53", diminished)).toBe("correct");
    expect(checkChordAnswer("Pov53", augmented)).toBe("correct");
    expect(checkChordAnswer("MD7", dominant)).toBe("correct");
  });

  it("distinguishes incorrect from invalid input", () => {
    expect(checkChordAnswer("M53", major)).toBe("incorrect");
    expect(checkChordAnswer("D99", major)).toBe("invalid");
    expect(checkChordAnswer("", major)).toBe("invalid");
  });

  it("accepts MS and MSm for all half-diminished inversions", () => {
    for (let inversion = 0; inversion < 4; inversion++) {
      const question = buildChordQuestion("half-diminished", inversion, C4);

      expect(question).not.toBeNull();
      if (!question) continue;

      const short = chordCode("half-diminished", inversion);
      const long = `MSm${short.slice(2)}`;

      expect(checkChordAnswer(short, question)).toBe("correct");
      expect(checkChordAnswer(long, question)).toBe("correct");
      expect(checkChordAnswer(long.toLowerCase(), question)).toBe("correct");
    }
  });
});

describe("Chord generation", () => {
  it("can generate all 40 forms", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      chordLevel: "all" as const,
    };

    const codes = CHORD_TYPES.flatMap((definition) =>
      definition.semitones.map((_, inversion) =>
        chordCode(definition.id, inversion),
      ),
    );

    const random = vi.spyOn(Math, "random");

    try {
      for (const [index, code] of codes.entries()) {
        random
          .mockReturnValueOnce((index + 0.5) / codes.length)
          .mockReturnValueOnce(0);

        const question = generateChordQuestion(settings);

        expect(identifyChord(question)).toBe(code);
      }
    } finally {
      random.mockRestore();
    }
  });

  it("keeps chords within the selected staff range", () => {
    for (const clef of CLEFS) {
      for (const difficulty of ["basic", "extended", "advanced"] as const) {
        const settings = {
          ...DEFAULT_SETTINGS,
          clef,
          difficulty,
          chordLevel: "all" as const,
        };

        const range = createNotePool({
          ...settings,
          accidentalLevel: "off",
        });

        const low = indexOf(range[0]);
        const high = indexOf(range[range.length - 1]);

        for (let i = 0; i < 30; i++) {
          const question = generateChordQuestion(settings);

          for (const note of question.notes) {
            expect(indexOf(note)).toBeGreaterThanOrEqual(low);
            expect(indexOf(note)).toBeLessThanOrEqual(high);
          }

          expect(identifyChord(question)).not.toBeNull();
        }
      }
    }
  });

  it("does not repeat the same question immediately", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      chordLevel: "all" as const,
    };

    const previous = generateChordQuestion(settings);

    for (let i = 0; i < 30; i++) {
      expect(generateChordQuestion(settings, previous)).not.toEqual(previous);
    }
  });

  it("integrates with the common exercise generator", () => {
    const question = generatePracticeQuestion({
      ...DEFAULT_SETTINGS,
      practiceMode: "chords",
    });

    expect(question.kind).toBe("chord");

    if (question.kind === "chord") {
      expect(identifyChord(question.value)).not.toBeNull();
    }
  });

  it.each([
    ["diminished", "S", "Sm"],
    ["augmented", "P", "Pov"],
    ["diminished-seventh", "S", "Sm"],
    ["augmented-seventh", "P", "Pov"],
  ] as const)("accepts both %s abbreviations", (type, short, long) => {
    const definition = CHORD_TYPES.find((item) => item.id === type)!;

    for (
      let inversion = 0;
      inversion < definition.semitones.length;
      inversion++
    ) {
      const question = buildChordQuestion(type, inversion, C4)!;
      const figures = chordCode(type, inversion).slice(short.length);

      expect(checkChordAnswer(short + figures, question)).toBe("correct");
      expect(checkChordAnswer(long + figures, question)).toBe("correct");
    }
  });
});

describe("Seventh chords and inversions", () => {
  const sevenths = CHORD_TYPES.filter(
    (definition) => definition.semitones.length === 4,
  );

  it("defines seven seventh chord types", () => {
    expect(sevenths).toHaveLength(7);
  });

  it("recognizes all 28 seventh chord forms", () => {
    const codes = new Set<string>();

    for (const definition of sevenths) {
      for (let inversion = 0; inversion < 4; inversion++) {
        const question = buildChordQuestion(definition.id, inversion, C4);

        expect(question).not.toBeNull();

        if (!question) continue;

        const code = chordCode(definition.id, inversion);

        expect(question.notes).toHaveLength(4);
        expect(identifyChord(question)).toBe(code);
        expect(checkChordAnswer(code, question)).toBe("correct");

        codes.add(code);
      }
    }

    expect(codes.size).toBe(28);
  });

  it("uses the correct seventh chord structures", () => {
    const expected = [
      ["dominant", [0, 4, 7, 10]],
      ["major-seventh", [0, 4, 7, 11]],
      ["minor-seventh", [0, 3, 7, 10]],
      ["minor-major-seventh", [0, 3, 7, 11]],
      ["half-diminished", [0, 3, 6, 10]],
      ["diminished-seventh", [0, 3, 6, 9]],
      ["augmented-seventh", [0, 4, 8, 11]],
    ] as const;

    for (const [type, intervals] of expected) {
      const question = buildChordQuestion(type, 0, C4);

      expect(question).not.toBeNull();

      if (!question) continue;

      const rootMidi = midiNumber(question.notes[0]);

      expect(question.notes.map((note) => midiNumber(note) - rootMidi)).toEqual(
        intervals,
      );
    }
  });

  it("accepts alternative symbols and figured bass", () => {
    const dominantFirst = buildChordQuestion("dominant", 1, C4)!;
    const dominantThird = buildChordQuestion("dominant", 3, C4)!;
    const diminished = buildChordQuestion("diminished-seventh", 0, C4)!;
    const augmented = buildChordQuestion("augmented-seventh", 0, C4)!;

    expect(checkChordAnswer("D6/5", dominantFirst)).toBe("correct");
    expect(checkChordAnswer("MD65", dominantFirst)).toBe("correct");
    expect(checkChordAnswer("D4/2", dominantThird)).toBe("correct");
    expect(checkChordAnswer("S7", diminished)).toBe("correct");
    expect(checkChordAnswer("Sm7", diminished)).toBe("correct");
    expect(checkChordAnswer("P7", augmented)).toBe("correct");
    expect(checkChordAnswer("Pov7", augmented)).toBe("correct");
  });

  it("generates only seventh chords in the new level", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      chordLevel: "sevenths" as const,
    };

    for (let i = 0; i < 100; i++) {
      const question = generateChordQuestion(settings);

      expect(question.notes).toHaveLength(4);
      expect(identifyChord(question)).not.toBeNull();
    }
  });
});
