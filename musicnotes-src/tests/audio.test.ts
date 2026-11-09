import { describe, expect, it } from "vitest";
import { midiNumber, noteFrequency } from "../src/domain/audio";
import type { AccidentalType, Letter, Question } from "../src/domain/music";

function note(
  letter: Letter,
  accidental: AccidentalType = "none",
  octave = 4,
): Question {
  return {
    letter,
    octave,
    clef: "treble",
    accidental,
  };
}

describe("Glazbena visina tona", () => {
  it("A4 iznosi 440 Hz", () => {
    expect(midiNumber(note("A"))).toBe(69);
    expect(noteFrequency(note("A"))).toBeCloseTo(440, 6);
  });

  it("C4 odgovara MIDI broju 60", () => {
    expect(midiNumber(note("C"))).toBe(60);
  });

  it("cis4 i des4 zvuče jednako", () => {
    expect(noteFrequency(note("C", "sharp"))).toBeCloseTo(
      noteFrequency(note("D", "flat")),
      6,
    );
  });

  it("cisis4 zvuči kao D4", () => {
    expect(midiNumber(note("C", "double-sharp"))).toBe(midiNumber(note("D")));
  });

  it("eisis4 zvuči kao fis4", () => {
    expect(midiNumber(note("E", "double-sharp"))).toBe(
      midiNumber(note("F", "sharp")),
    );
  });

  it("eses4 zvuči kao D4", () => {
    expect(midiNumber(note("E", "double-flat"))).toBe(midiNumber(note("D")));
  });

  it("asas4 zvuči kao G4", () => {
    expect(midiNumber(note("A", "double-flat"))).toBe(midiNumber(note("G")));
  });

  it("his3 zvuči kao C4", () => {
    expect(midiNumber(note("B", "sharp", 3))).toBe(midiNumber(note("C")));
  });

  it("H♭ je jedan poluton niži od H", () => {
    expect(midiNumber(note("B", "flat"))).toBe(midiNumber(note("B")) - 1);
  });

  it("razrješilica ne mijenja visinu prirodne note", () => {
    expect(midiNumber(note("F", "natural"))).toBe(
      midiNumber(note("F", "none")),
    );
  });

  it("viša oktava ima dvostruku frekvenciju", () => {
    expect(noteFrequency(note("A", "none", 5))).toBeCloseTo(
      noteFrequency(note("A", "none", 4)) * 2,
      6,
    );
  });
});
