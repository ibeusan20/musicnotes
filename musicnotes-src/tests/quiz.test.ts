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
});
