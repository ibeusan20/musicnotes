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

// Svaka dijatonska pozicija odgovara jednom
// koraku: C, D, E, F, G, A, B.
// Oktava se računa po sedam pozicija.

// Donja crta violinskog ključa: E4.
// Donja crta basovskog ključa: G2.
const BOTTOM_LINE: Record<Clef, number> = {
  treble: 4 * 7 + 2,
  bass: 2 * 7 + 4,
};

// Jedna pomoćna crta odgovara udaljenosti
// od dva dijatonska koraka izvan crtovlja.
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

    // Osnovnih devet pozicija, pet crta + četiri međuprostora.
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

  // Ne prikazuje potpuno isto pitanje dva puta uzastopno.
  const candidates = previous
    ? pool.filter((item) => !sameQuestion(item, previous))
    : pool;

  const index = Math.floor(Math.random() * candidates.length);

  return candidates[index];
}

export function noteLabel(question: Question, includeOctave = false): string {
  // U hrvatskoj notaciji B natural = H.
  const letter = question.letter === "B" ? "H" : question.letter;

  return includeOctave ? `${letter}${question.octave}` : letter;
}

export function expectedAnswer(question: Question, mode: AnswerMode): string {
  return noteLabel(question, mode === "letter-octave");
}
