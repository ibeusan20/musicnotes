import { describe, expect, it } from "vitest";
import { checkAnswer } from "../src/domain/quiz";

import {
  expectedAnswer,
  type AccidentalType,
  type Question,
} from "../src/domain/music";

function question(accidental: AccidentalType): Question {
  return {
    letter: "B",
    octave: 4,
    clef: "treble",
    accidental,
  };
}

describe("Provjera odgovora", () => {
  it("prihvaća velika i mala slova", () => {
    expect(checkAnswer(" HIS ", question("sharp"), "letter")).toBe("correct");
    expect(checkAnswer("his", question("sharp"), "letter")).toBe("correct");
  });

  it("prihvaća hes i b za H♭", () => {
    const note = question("flat");
    expect(checkAnswer("hes", note, "letter")).toBe("correct");
    expect(checkAnswer("B", note, "letter")).toBe("correct");
    expect(checkAnswer("b4", note, "letter-octave")).toBe("correct");
  });

  it("ne prihvaća b za prirodni H", () => {
    expect(checkAnswer("h", question("natural"), "letter")).toBe("correct");
    expect(checkAnswer("b", question("natural"), "letter")).toBe("incorrect");
  });

  it("razrješilica ne mijenja naziv", () => {
    expect(expectedAnswer(question("natural"), "letter")).toBe("h");
    expect(expectedAnswer(question("none"), "letter")).toBe("h");
  });

  it("razlikuje ispravne i pogrešne nazive", () => {
    const note = question("sharp");
    expect(checkAnswer("h", note, "letter")).toBe("incorrect");
    expect(checkAnswer("gibberish", note, "letter")).toBe("invalid");
    expect(checkAnswer("", note, "letter")).toBe("invalid");
  });

  it("provjerava oktavu", () => {
    const note = question("sharp");
    expect(checkAnswer("his4", note, "letter-octave")).toBe("correct");
    expect(checkAnswer("his3", note, "letter-octave")).toBe("incorrect");
    expect(checkAnswer("his", note, "letter-octave")).toBe("invalid");
    expect(checkAnswer("his4", note, "letter")).toBe("invalid");
  });

  it.each([
    ["C", "cisis"],
    ["D", "disis"],
    ["E", "eisis"],
    ["F", "fisis"],
    ["G", "gisis"],
    ["A", "aisis"],
    ["B", "hisis"],
  ] as const)("prihvaća dvostruko povišeni %s", (letter, name) => {
    const note: Question = {
      letter,
      octave: 4,
      clef: "treble",
      accidental: "double-sharp",
    };

    expect(checkAnswer(name, note, "letter")).toBe("correct");

    expect(checkAnswer(`${name}4`, note, "letter-octave")).toBe("correct");
  });

  it("prihvaća sve dvostruko snižene note", () => {
    const names = ["ceses", "deses", "eses", "feses", "geses", "asas", "heses"];
    const letters = ["C", "D", "E", "F", "G", "A", "B"] as const;

    for (const [index, name] of names.entries()) {
      const note: Question = {
        letter: letters[index],
        octave: 4,
        clef: "treble",
        accidental: "double-flat",
      };
      expect(checkAnswer(name, note, "letter")).toBe("correct");
      expect(checkAnswer(`${name}4`, note, "letter-octave")).toBe("correct");
    }
  });

  it("ne miješa jednostruke i dvostruke predznake", () => {
    const note: Question = {
      letter: "E",
      octave: 4,
      clef: "treble",
      accidental: "double-flat",
    };

    expect(checkAnswer("eses", note, "letter")).toBe("correct");
    expect(checkAnswer("es", note, "letter")).toBe("incorrect");
    expect(checkAnswer("e", note, "letter")).toBe("incorrect");
  });
});
