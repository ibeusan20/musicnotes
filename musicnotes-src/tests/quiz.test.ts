import { describe, expect, it } from "vitest";

import {
  createNotePool,
  generateQuestion,
  sameQuestion,
  type Question,
  type Settings,
} from "../src/domain/music";

import { checkAnswer } from "../src/domain/quiz";

import {
  emptySession,
  emptyTotal,
  recordResult,
  successRate,
} from "../src/domain/statistics";

const basicTreble: Settings = {
  clef: "treble",
  difficulty: "basic",
  answerMode: "letter",
};

const extendedBass: Settings = {
  clef: "bass",
  difficulty: "extended",
  answerMode: "letter",
};

describe("Generator nota", () => {
  it("stvara 9 pozicija u osnovnoj težini", () => {
    const pool = createNotePool(basicTreble);

    expect(pool).toHaveLength(9);

    expect(pool[0]).toEqual({
      letter: "E",
      octave: 4,
      clef: "treble",
    });

    expect(pool[8]).toEqual({
      letter: "F",
      octave: 5,
      clef: "treble",
    });
  });

  it("podržava pomoćne crte u basovskom ključu", () => {
    const pool = createNotePool(extendedBass);

    expect(pool).toHaveLength(17);

    expect(pool[0]).toEqual({
      letter: "C",
      octave: 2,
      clef: "bass",
    });

    expect(pool[16]).toEqual({
      letter: "E",
      octave: 4,
      clef: "bass",
    });
  });

  it("nasumični ključ uključuje oba crtovlja", () => {
    const pool = createNotePool({
      ...basicTreble,
      clef: "random",
    });

    expect(pool).toHaveLength(18);

    expect(pool.some((n) => n.clef === "treble")).toBe(true);

    expect(pool.some((n) => n.clef === "bass")).toBe(true);
  });

  it("ne ponavlja identično prethodno pitanje", () => {
    const previous: Question = {
      letter: "E",
      octave: 4,
      clef: "treble",
    };

    for (let i = 0; i < 50; i++) {
      const next = generateQuestion(basicTreble, previous);

      expect(sameQuestion(next, previous)).toBe(false);
    }
  });
});

describe("Provjera odgovora", () => {
  const question: Question = {
    letter: "B",
    octave: 4,
    clef: "treble",
  };

  it("prihvaća hrvatski naziv H", () => {
    expect(checkAnswer("H", question, "letter")).toBe("correct");

    expect(checkAnswer(" h ", question, "letter")).toBe("correct");
  });

  it("odbija engleski B kao hrvatski H", () => {
    expect(checkAnswer("B", question, "letter")).toBe("invalid");
  });

  it("prepoznaje pogrešan valjan odgovor", () => {
    expect(checkAnswer("G", question, "letter")).toBe("incorrect");
  });

  it("provjerava oktavu", () => {
    expect(checkAnswer("H4", question, "letter-octave")).toBe("correct");

    expect(checkAnswer("H3", question, "letter-octave")).toBe("incorrect");
  });

  it("ne prihvaća prazan odgovor", () => {
    expect(checkAnswer("", question, "letter")).toBe("invalid");
  });
});

describe("Statistika", () => {
  it("povećava streak nakon točnog odgovora", () => {
    const result = recordResult(emptySession(), emptyTotal(), true);

    expect(result.session.correct).toBe(1);
    expect(result.session.streak).toBe(1);
    expect(result.total.correct).toBe(1);
  });

  it("resetira streak nakon pogreške", () => {
    const first = recordResult(emptySession(), emptyTotal(), true);

    const second = recordResult(first.session, first.total, true);

    const third = recordResult(second.session, second.total, false);

    expect(third.session.streak).toBe(0);
    expect(third.session.bestStreak).toBe(2);
    expect(third.total.bestStreak).toBe(2);
    expect(third.session.incorrect).toBe(1);
  });

  it("ispravno računa postotak", () => {
    expect(successRate(0, 0)).toBe(0);
    expect(successRate(3, 1)).toBe(75);
    expect(successRate(1, 2)).toBe(33);
  });
});
