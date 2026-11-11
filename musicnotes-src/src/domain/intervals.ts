import {
  createNotePool,
  indexToPitch,
  LETTERS,
  sameQuestion,
  type AccidentalType,
  type Question,
  type Settings,
} from "./music";

import { midiNumber } from "./audio";
import type { AnswerResult } from "./quiz";

export const INTERVALS = [
  { code: "č1", degree: 1, semitones: 0 },
  { code: "pov1", degree: 1, semitones: 1 },

  { code: "sm2", degree: 2, semitones: 0 },
  { code: "m2", degree: 2, semitones: 1 },
  { code: "v2", degree: 2, semitones: 2 },
  { code: "pov2", degree: 2, semitones: 3 },

  { code: "sm3", degree: 3, semitones: 2 },
  { code: "m3", degree: 3, semitones: 3 },
  { code: "v3", degree: 3, semitones: 4 },
  { code: "pov3", degree: 3, semitones: 5 },

  { code: "sm4", degree: 4, semitones: 4 },
  { code: "č4", degree: 4, semitones: 5 },
  { code: "pov4", degree: 4, semitones: 6 },

  { code: "sm5", degree: 5, semitones: 6 },
  { code: "č5", degree: 5, semitones: 7 },
  { code: "pov5", degree: 5, semitones: 8 },

  { code: "sm6", degree: 6, semitones: 7 },
  { code: "m6", degree: 6, semitones: 8 },
  { code: "v6", degree: 6, semitones: 9 },
  { code: "pov6", degree: 6, semitones: 10 },

  { code: "sm7", degree: 7, semitones: 9 },
  { code: "m7", degree: 7, semitones: 10 },
  { code: "v7", degree: 7, semitones: 11 },
  { code: "pov7", degree: 7, semitones: 12 },

  { code: "sm8", degree: 8, semitones: 11 },
  { code: "č8", degree: 8, semitones: 12 },
  { code: "pov8", degree: 8, semitones: 13 },
] as const;

export type IntervalCode = (typeof INTERVALS)[number]["code"];

export interface IntervalQuestion {
  first: Question;
  second: Question;
}

// Most commonly practised intervals, including those requested.
export const COMMON_INTERVALS: ReadonlySet<IntervalCode> = new Set([
  "č1",
  "m2",
  "v2",
  "m3",
  "v3",
  "č4",
  "pov4",
  "sm5",
  "č5",
  "pov5",
  "m6",
  "v6",
  "m7",
  "v7",
  "č8",
]);

// Required alteration of the second note, in semitones.
const OFFSET_TO_ACCIDENTAL = new Map<number, AccidentalType>([
  [-2, "double-flat"],
  [-1, "flat"],
  [0, "none"],
  [1, "sharp"],
  [2, "double-sharp"],
]);

function diatonicIndex(note: Pick<Question, "letter" | "octave">): number {
  return note.octave * LETTERS.length + LETTERS.indexOf(note.letter);
}

// Identify the written interval using both diatonic and chromatic distance.
export function identifyInterval(
  question: IntervalQuestion,
): IntervalCode | null {
  const degree =
    diatonicIndex(question.second) - diatonicIndex(question.first) + 1;
  const semitones = midiNumber(question.second) - midiNumber(question.first);

  return (
    INTERVALS.find(
      (interval) =>
        interval.degree === degree && interval.semitones === semitones,
    )?.code ?? null
  );
}

function sameInterval(a: IntervalQuestion, b: IntervalQuestion): boolean {
  return sameQuestion(a.first, b.first) && sameQuestion(a.second, b.second);
}

export function generateIntervalQuestion(
  settings: Settings,
  previous?: IntervalQuestion,
): IntervalQuestion {
  // Use natural starting notes in the selected clef and range.
  // Accidentals of the second note are calculated independently.
  const naturals = createNotePool({
    ...settings,
    accidentalLevel: "off",
  });

  const availablePositions = new Set(
    naturals.map((note) => `${note.clef}:${diatonicIndex(note)}`),
  );

  // Group by interval to avoid favouring smaller intervals,
  // which otherwise have more possible starting positions.
  const groups: IntervalQuestion[][] = [];

  for (const interval of INTERVALS) {
    if (
      settings.intervalLevel === "common" &&
      !COMMON_INTERVALS.has(interval.code)
    ) {
      continue;
    }

    const group: IntervalQuestion[] = [];

    for (const first of naturals) {
      const secondIndex = diatonicIndex(first) + interval.degree - 1;

      // Both notes must fit the chosen staff range.
      if (!availablePositions.has(`${first.clef}:${secondIndex}`)) {
        continue;
      }

      const second: Question = {
        ...indexToPitch(secondIndex),
        clef: first.clef,
        accidental: "none",
      };

      const naturalDistance = midiNumber(second) - midiNumber(first);
      const offset = interval.semitones - naturalDistance;
      const accidental = OFFSET_TO_ACCIDENTAL.get(offset);

      if (accidental === undefined) continue;

      const candidate: IntervalQuestion = {
        first,
        second: { ...second, accidental },
      };

      if (!previous || !sameInterval(candidate, previous)) {
        group.push(candidate);
      }
    }

    if (group.length > 0) {
      groups.push(group);
    }
  }

  if (groups.length === 0) {
    throw new Error("No interval questions available.");
  }

  const group = groups[Math.floor(Math.random() * groups.length)];

  return group[Math.floor(Math.random() * group.length)];
}

export function checkIntervalAnswer(
  raw: string,
  question: IntervalQuestion,
): AnswerResult {
  const input = raw.normalize("NFC").trim().toLowerCase().replace(/\s+/g, "");

  // ASCII alternative for keyboards without the Croatian Č key.
  const answer = /^c([1458])$/.test(input) ? `č${input.slice(1)}` : input;

  if (!INTERVALS.some((item) => item.code === answer)) {
    return "invalid";
  }

  return answer === identifyInterval(question) ? "correct" : "incorrect";
}
