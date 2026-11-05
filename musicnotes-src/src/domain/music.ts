export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type Letter = (typeof LETTERS)[number];
export type Clef = "treble" | "bass";
export type ClefSelection = Clef | "random";
export type Difficulty = "basic" | "extended" | "advanced";
export type AnswerMode = "letter" | "letter-octave";

export interface Settings {
  clef: ClefSelection;
  difficulty: Difficulty;
  answerMode: AnswerMode;
}

export interface Question {
  letter: Letter;
  octave: number;
  clef: Clef;
}

export const DEFAULT_SETTINGS: Settings = {
  clef: "random",
  difficulty: "basic",
  answerMode: "letter",
};

// Every diatonic position corresponds to one step: C, D, E, F, G, A, B. Ottava is calculated by seven positions.

// Bottom line of the treble clef is E4, which is 4 octaves and 4 diatonic steps from C0.
// Bottom line of the bass clef is G2, which is 2 octaves and 4 diatonic steps from C0.
const BOTTOM_LINE: Record<Clef, number> = {
  treble: 4 * 7 + 2,
  bass: 2 * 7 + 4,
};

// Jedna pomoćna crta odgovara udaljenosti od dva dijatonska koraka izvan crtovlja.
const EXTRA_STEPS: Record<Difficulty, number> = {
  basic: 0,
  extended: 4,
  advanced: 8,
};

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

  return clefs.flatMap((clef) => {
    const bottom = BOTTOM_LINE[clef];

    // Basic nine positions, five lines + four spaces. Extended and advanced add extra ledger lines.
    const count = 9 + 2 * extra;

    return Array.from({ length: count }, (_, i) => ({
      ...indexToPitch(bottom - extra + i),
      clef,
    }));
  });
}

export function sameQuestion(a: Question, b: Question): boolean {
  return a.clef === b.clef && a.letter === b.letter && a.octave === b.octave;
}

export function generateQuestion(
  settings: Settings,
  previous?: Question,
): Question {
  const pool = createNotePool(settings);

  // Does not guarantee that the same question won't appear again later.
  const candidates = previous
    ? pool.filter((item) => !sameQuestion(item, previous))
    : pool;

  const index = Math.floor(Math.random() * candidates.length);

  return candidates[index];
}

export function noteLabel(question: Question, includeOctave = false): string {
  // In croatian notation, B natural is represented as H.
  const letter = question.letter === "B" ? "H" : question.letter;

  return includeOctave ? `${letter}${question.octave}` : letter;
}

export function expectedAnswer(question: Question, mode: AnswerMode): string {
  return noteLabel(question, mode === "letter-octave");
}
