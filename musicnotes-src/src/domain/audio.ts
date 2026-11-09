import type { AccidentalType, Letter, Question } from "./music";
// Semitones relative to C.
const SEMITONES: Record<Letter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

// How many semitones an accidental shifts the pitch.
const ALTERATION: Record<AccidentalType, number> = {
  none: 0,
  natural: 0,
  sharp: 1,
  flat: -1,
  "double-sharp": 2,
  "double-flat": -2,
};

// C4 = MIDI 60; A4 = MIDI 69.
export function midiNumber(note: Question): number {
  return (
    (note.octave + 1) * 12 +
    SEMITONES[note.letter] +
    ALTERATION[note.accidental]
  );
}

// Standard tuning: A4 = 440 Hz.
export function noteFrequency(note: Question): number {
  return 440 * 2 ** ((midiNumber(note) - 69) / 12);
}
