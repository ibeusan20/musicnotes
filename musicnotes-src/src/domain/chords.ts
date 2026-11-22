import {
  CLEFS,
  LETTERS,
  createNotePool,
  indexToPitch,
  sameQuestion,
  type AccidentalType,
  type Clef,
  type Question,
  type Settings,
} from "./music";

import { midiNumber } from "./audio";
import type { AnswerResult } from "./quiz";

// Semitones measured from the root.
// Croatian chord symbols follow the HDGPP convention.
export const CHORD_TYPES = [
  { id: "major", prefix: "D", semitones: [0, 4, 7] },
  { id: "minor", prefix: "M", semitones: [0, 3, 7] },
  { id: "diminished", prefix: "S", semitones: [0, 3, 6] },
  { id: "augmented", prefix: "P", semitones: [0, 4, 8] },

  { id: "dominant", prefix: "D", semitones: [0, 4, 7, 10] },
  { id: "major-seventh", prefix: "VD", semitones: [0, 4, 7, 11] },
  { id: "minor-seventh", prefix: "MM", semitones: [0, 3, 7, 10] },
  { id: "minor-major-seventh", prefix: "VM", semitones: [0, 3, 7, 11] },
  { id: "half-diminished", prefix: "MS", semitones: [0, 3, 6, 10] },
  { id: "diminished-seventh", prefix: "S", semitones: [0, 3, 6, 9] },
  { id: "augmented-seventh", prefix: "P", semitones: [0, 4, 8, 11] },
] as const;

export type ChordType = (typeof CHORD_TYPES)[number]["id"];

export interface ChordQuestion {
  clef: Clef;
  // The notes are ordered from lowest to highest.
  notes: Question[];
}

const TRIAD_FIGURES = ["53", "6", "64"] as const;
const SEVENTH_FIGURES = ["7", "65", "43", "2"] as const;

const ROOT_ACCIDENTALS = [
  "none",
  "sharp",
  "flat",
] as const satisfies readonly AccidentalType[];

const ALTERATIONS = new Map<number, AccidentalType>([
  [-2, "double-flat"],
  [-1, "flat"],
  [0, "none"],
  [1, "sharp"],
  [2, "double-sharp"],
]);

function diatonicIndex(note: Question): number {
  return note.octave * 7 + LETTERS.indexOf(note.letter);
}

function chordDefinition(type: ChordType) {
  const definition = CHORD_TYPES.find((item) => item.id === type);

  if (!definition) {
    throw new Error("Unknown chord type");
  }

  return definition;
}

export function chordCode(type: ChordType, inversion: number): string {
  const definition = chordDefinition(type);

  const figures =
    definition.semitones.length === 3 ? TRIAD_FIGURES : SEVENTH_FIGURES;

  if (inversion < 0 || inversion >= figures.length) {
    throw new Error("Invalid chord inversion");
  }

  return `${definition.prefix}${figures[inversion]}`;
}

export function buildChordQuestion(
  type: ChordType,
  inversion: number,
  root: Question,
): ChordQuestion | null {
  const definition = chordDefinition(type);

  if (
    !Number.isInteger(inversion) ||
    inversion < 0 ||
    inversion >= definition.semitones.length
  ) {
    throw new Error("Invalid chord inversion");
  }

  const rootIndex = diatonicIndex(root);
  const rootMidi = midiNumber(root);
  const notes: Question[] = [];

  // Build a tertian chord: root, third, fifth, seventh.
  for (const [step, semitones] of definition.semitones.entries()) {
    const pitch = indexToPitch(rootIndex + 2 * step);

    const natural: Question = {
      ...pitch,
      clef: root.clef,
      accidental: "none",
    };

    const alteration = rootMidi + semitones - midiNumber(natural);

    const accidental = ALTERATIONS.get(alteration);

    // Do not generate spellings requiring triple accidentals.
    if (accidental === undefined) return null;

    notes.push({
      ...natural,
      accidental,
    });
  }

  // Move the lowest notes up an octave for each inversion.
  return {
    clef: root.clef,
    notes: [
      ...notes.slice(inversion),
      ...notes.slice(0, inversion).map((note) => ({
        ...note,
        octave: note.octave + 1,
      })),
    ],
  };
}

// Determine the chord from the actual written notes.
// This respects enharmonic spelling and the bass note.
export function identifyChord(question: ChordQuestion): string | null {
  const notes = question.notes;

  if (notes.length !== 3 && notes.length !== 4) {
    return null;
  }

  // A written chord must run upwards.
  if (
    notes.some(
      (note, index) =>
        index > 0 && diatonicIndex(note) <= diatonicIndex(notes[index - 1]),
    )
  ) {
    return null;
  }

  for (let inversion = 0; inversion < notes.length; inversion++) {
    const pivot = inversion === 0 ? 0 : notes.length - inversion;

    // Undo the inversion and restore a root-position chord.
    const ordered = [
      ...notes.slice(pivot),
      ...notes.slice(0, pivot).map((note) => ({
        ...note,
        octave: note.octave + 1,
      })),
    ];

    const root = ordered[0];

    for (const definition of CHORD_TYPES) {
      if (definition.semitones.length !== notes.length) continue;

      const matches = definition.semitones.every(
        (semitones, step) =>
          diatonicIndex(ordered[step]) === diatonicIndex(root) + 2 * step &&
          midiNumber(ordered[step]) - midiNumber(root) === semitones,
      );

      if (matches) {
        return chordCode(definition.id, inversion);
      }
    }
  }

  return null;
}

function sameChord(a: ChordQuestion, b: ChordQuestion): boolean {
  return (
    a.clef === b.clef &&
    a.notes.length === b.notes.length &&
    a.notes.every((note, index) => sameQuestion(note, b.notes[index]))
  );
}

function allowedTypes(settings: Settings) {
  return CHORD_TYPES.filter((definition) => {
    if (settings.chordLevel === "basic") {
      return definition.id === "major" || definition.id === "minor";
    }

    if (settings.chordLevel === "triads") {
      return definition.semitones.length === 3;
    }

    return true;
  });
}

export function generateChordQuestion(
  settings: Settings,
  previous?: ChordQuestion,
): ChordQuestion {
  const clefs: readonly Clef[] =
    settings.clef === "random"
      ? CLEFS
      : settings.clef === "treble-bass"
        ? ["treble", "bass"]
        : [settings.clef];

  // One group per chord type and inversion.
  // Choosing a group first keeps all chord types balanced.
  const groups: ChordQuestion[][] = [];

  for (const definition of allowedTypes(settings)) {
    for (
      let inversion = 0;
      inversion < definition.semitones.length;
      inversion++
    ) {
      const candidates: ChordQuestion[] = [];

      for (const clef of clefs) {
        // Reuse the existing staff ranges and difficulty levels.
        const positions = createNotePool({
          ...settings,
          clef,
          accidentalLevel: "off",
        });

        const low = diatonicIndex(positions[0]);
        const high = diatonicIndex(positions[positions.length - 1]);

        for (let octave = 1; octave <= 6; octave++) {
          for (const letter of LETTERS) {
            for (const accidental of ROOT_ACCIDENTALS) {
              const root: Question = {
                letter,
                octave,
                clef,
                accidental,
              };

              const question = buildChordQuestion(
                definition.id,
                inversion,
                root,
              );

              if (!question) continue;

              if (
                !question.notes.every((note) => {
                  const index = diatonicIndex(note);
                  return index >= low && index <= high;
                })
              ) {
                continue;
              }

              if (previous && sameChord(question, previous)) {
                continue;
              }

              candidates.push(question);
            }
          }
        }
      }

      if (candidates.length > 0) {
        groups.push(candidates);
      }
    }
  }

  if (groups.length === 0) {
    throw new Error("No chord questions available");
  }

  const group = groups[Math.floor(Math.random() * groups.length)];

  return group[Math.floor(Math.random() * group.length)];
}

function normalizeChordAnswer(raw: string): string {
  let input = raw
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[/⁄]/g, "")
    .toUpperCase();

  // Accept descriptive abbreviations for altered triads.
  if (input.startsWith("POV")) {
    input = `P${input.slice(3)}`;
  } else if (input.startsWith("SM")) {
    input = `S${input.slice(2)}`;
  }

  // MD7 is an alternative for dominant D7.
  if (/^MD(7|65|43|2|42)$/.test(input)) {
    input = `D${input.slice(2)}`;
  }

  // Common extended figured-bass spellings.
  input = input.replace(/63$/, "6");
  input = input.replace(/42$/, "2");

  return input;
}

export function checkChordAnswer(
  raw: string,
  question: ChordQuestion,
): AnswerResult {
  const answer = normalizeChordAnswer(raw);

  const knownCodes = new Set(
    CHORD_TYPES.flatMap((definition) =>
      definition.semitones.map((_, inversion) =>
        chordCode(definition.id, inversion),
      ),
    ),
  );

  if (!knownCodes.has(answer)) return "invalid";

  return identifyChord(question) === answer ? "correct" : "incorrect";
}
