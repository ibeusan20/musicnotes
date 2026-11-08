import { describe, expect, it } from "vitest";

import {
  createNotePool,
  generateQuestion,
  noteName,
  sameQuestion,
  type Question,
  type Settings,
} from "../src/domain/music";

const settings: Settings = {
  clef: "treble",
  difficulty: "basic",
  answerMode: "letter",
  accidentalLevel: "off",
};

describe("Glazbeni raspon", () => {
  it("prikazuje E4-F5 u osnovnom violinskom ključu", () => {
    const pool = createNotePool(settings);

    expect(pool).toHaveLength(9);

    expect(pool[0]).toMatchObject({
      letter: "E",
      octave: 4,
      accidental: "none",
    });

    expect(pool[8]).toMatchObject({
      letter: "F",
      octave: 5,
    });
  });

  it("proširena težina uključuje pomoćne crte", () => {
    const pool = createNotePool({
      ...settings,
      clef: "bass",
      difficulty: "extended",
    });

    expect(pool).toHaveLength(17);
    expect(pool[0]).toMatchObject({
      letter: "C",
      octave: 2,
    });
  });

  it("nasumični ključ uključuje oba ključa", () => {
    const pool = createNotePool({
      ...settings,
      clef: "random",
    });

    expect(new Set(pool.map((q) => q.clef))).toEqual(
      new Set(["treble", "bass"]),
    );
  });
});

describe("Predznaci", () => {
  it("bez predznaka generira samo prirodne note", () => {
    const pool = createNotePool(settings);
    expect(pool.every((q) => q.accidental === "none")).toBe(true);
  });

  it("generira sve jednostruke predznake", () => {
    const pool = createNotePool({
      ...settings,
      accidentalLevel: "single",
    });

    expect(pool).toHaveLength(36);

    expect(new Set(pool.map((q) => q.accidental))).toEqual(
      new Set(["none", "natural", "sharp", "flat"]),
    );
  });

  it.each([
    ["C", "cis", "ces"],
    ["D", "dis", "des"],
    ["E", "eis", "es"],
    ["F", "fis", "fes"],
    ["G", "gis", "ges"],
    ["A", "ais", "as"],
    ["B", "his", "hes"],
  ] as const)("ispravno imenuje %s s predznacima", (letter, sharp, flat) => {
    expect(
      noteName({
        letter,
        accidental: "sharp",
      }),
    ).toBe(sharp);

    expect(
      noteName({
        letter,
        accidental: "flat",
      }),
    ).toBe(flat);

    expect(
      noteName({
        letter,
        accidental: "natural",
      }),
    ).toBe(letter === "B" ? "h" : letter.toLowerCase());
  });

  it("generira svih šest vrsta predznaka", () => {
    const pool = createNotePool({
      ...settings,
      accidentalLevel: "double",
    });

    expect(pool).toHaveLength(54);

    expect(new Set(pool.map((q) => q.accidental))).toEqual(
      new Set([
        "none",
        "natural",
        "sharp",
        "flat",
        "double-sharp",
        "double-flat",
      ]),
    );
  });

  it.each([
    ["C", "cisis", "ceses"],
    ["D", "disis", "deses"],
    ["E", "eisis", "eses"],
    ["F", "fisis", "feses"],
    ["G", "gisis", "geses"],
    ["A", "aisis", "asas"],
    ["B", "hisis", "heses"],
  ] as const)(
    "ispravno imenuje dvostruke predznake za %s",
    (letter, sharp, flat) => {
      expect(
        noteName({
          letter,
          accidental: "double-sharp",
        }),
      ).toBe(sharp);

      expect(
        noteName({
          letter,
          accidental: "double-flat",
        }),
      ).toBe(flat);
    },
  );
});

describe("Generiranje pitanja", () => {
  it("ne ponavlja identično pitanje", () => {
    const previous: Question = {
      letter: "E",
      octave: 4,
      clef: "treble",
      accidental: "none",
    };

    for (let i = 0; i < 30; i++) {
      const next = generateQuestion(settings, previous);
      expect(sameQuestion(next, previous)).toBe(false);
    }
  });

  it("razlikuje notu s razrješilicom", () => {
    const base: Question = {
      letter: "C",
      octave: 4,
      clef: "treble",
      accidental: "none",
    };

    expect(
      sameQuestion(base, {
        ...base,
        accidental: "natural",
      }),
    ).toBe(false);
  });
});
