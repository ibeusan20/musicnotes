export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type Letter = (typeof LETTERS)[number];
export type Clef = "treble" | "bass";
export type ClefSelection = Clef | "random";
export type Difficulty = "basic" | "extended" | "advanced";
export type AnswerMode = "letter" | "letter-octave";
export type AccidentalLevel = "off" | "single" | "double";

export type AccidentalType =
  | "none"
  | "natural"
  | "sharp"
  | "flat"
  | "double-sharp"
  | "double-flat";

export interface Settings {
  clef: ClefSelection;
  difficulty: Difficulty;
  answerMode: AnswerMode;
  accidentalLevel: AccidentalLevel;
}

export interface Question {
  letter: Letter;
  octave: number;
  clef: Clef;
  accidental: AccidentalType;
}

export const DEFAULT_SETTINGS: Settings = {
  clef: "random",
  difficulty: "basic",
  answerMode: "letter",
  accidentalLevel: "off",
};

// Diatonic index: C0 = 0.
// Every octave has seven positions.
const BOTTOM_LINE: Record<Clef, number> = {
  treble: 4 * 7 + 2, // E4
  bass: 2 * 7 + 4, // G2
};

const EXTRA_STEPS: Record<Difficulty, number> = {
  basic: 0,
  extended: 4,
  advanced: 8,
};

const SINGLE_ACCIDENTALS: readonly AccidentalType[] = [
  "none",
  "natural",
  "sharp",
  "flat",
];

const DOUBLE_ACCIDENTALS: readonly AccidentalType[] = [
  ...SINGLE_ACCIDENTALS,
  "double-sharp",
  "double-flat",
];

export function indexToPitch(
  index: number,
): Pick<Question, "letter" | "octave"> {
  return {
    letter: LETTERS[index % 7],
    octave: Math.floor(index / 7),
  };
}

export function createNotePool(settings: Settings): Question[] {
  const clefs: Clef[] =
    settings.clef === "random" ? ["treble", "bass"] : [settings.clef];

  const extra = EXTRA_STEPS[settings.difficulty];

  const accidentals: readonly AccidentalType[] =
    settings.accidentalLevel === "off"
      ? ["none"]
      : settings.accidentalLevel === "single"
        ? SINGLE_ACCIDENTALS
        : DOUBLE_ACCIDENTALS;

  return clefs.flatMap((clef) => {
    const bottom = BOTTOM_LINE[clef];

    // 9 basic positions + extra positions.
    return Array.from({ length: 9 + extra * 2 }, (_, index) =>
      indexToPitch(bottom - extra + index),
    ).flatMap((pitch) =>
      accidentals.map((accidental) => ({
        ...pitch,
        clef,
        accidental,
      })),
    );
  });
}

export function sameQuestion(a: Question, b: Question): boolean {
  return (
    a.clef === b.clef &&
    a.letter === b.letter &&
    a.octave === b.octave &&
    a.accidental === b.accidental
  );
}

export function generateQuestion(
  settings: Settings,
  previous?: Question,
): Question {
  const pool = createNotePool(settings);

  const candidates = previous
    ? pool.filter((note) => !sameQuestion(note, previous))
    : pool;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Musical name does not depend on octave or clef.
export function noteName(
  question: Pick<Question, "letter" | "accidental">,
): string {
  // VexFlow: B. Croatian notation: H.
  const base = question.letter === "B" ? "h" : question.letter.toLowerCase();

  switch (question.accidental) {
    case "none":
    case "natural":
      return base;

    case "sharp":
      return `${base}is`;

    case "flat":
      if (question.letter === "E") return "es";
      if (question.letter === "A") return "as";
      return `${base}es`;

    case "double-sharp":
      return `${base}isis`;

    case "double-flat":
      if (question.letter === "E") return "eses";
      if (question.letter === "A") return "asas";
      return `${base}eses`;
  }
}

// Canonical form for answer comparison.
export function expectedAnswer(question: Question, mode: AnswerMode): string {
  const name = noteName(question);

  return mode === "letter-octave" ? `${name}${question.octave}` : name;
}

// Shape displayed in feedback.
export function noteLabel(question: Question, includeOctave = false): string {
  const name = noteName(question);

  const display =
    question.accidental === "none" || question.accidental === "natural"
      ? name.toUpperCase()
      : name;

  return includeOctave ? `${display}${question.octave}` : display;
}
