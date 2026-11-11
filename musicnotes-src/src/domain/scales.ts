import {
  CLEFS,
  LETTERS,
  indexToPitch,
  noteName,
  type AccidentalType,
  type Clef,
  type Letter,
  type Settings,
} from "./music";

import type { AnswerResult } from "./quiz";

// Circle of fifths: seven flats through seven sharps.
export const MAJOR_KEYS = [
  "Cb",
  "Gb",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F",
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "C#",
] as const;

export type MajorKey = (typeof MAJOR_KEYS)[number];

export const SCALE_TYPES = [
  "major",
  "minor-natural",
  "minor-harmonic",
  "minor-melodic",
] as const;

export type ScaleType = (typeof SCALE_TYPES)[number];

export interface ScaleNote {
  letter: Letter;
  octave: number;
  // Only explicitly written accidental.
  // The key signature supplies the remaining alterations.
  accidental: AccidentalType;
}

export interface ScaleQuestion {
  type: ScaleType;
  tonic: string;
  keySignature: MajorKey;
  clef: Clef;
  notes: ScaleNote[];
}

const SHARPS: readonly Letter[] = ["F", "C", "G", "D", "A", "E", "B"];

const FLATS: readonly Letter[] = ["B", "E", "A", "D", "G", "C", "F"];

// Relative minor begins on the sixth degree of major.
const MODE_OFFSET: Record<ScaleType, number> = {
  major: 0,
  "minor-natural": 5,
  "minor-harmonic": 5,
  "minor-melodic": 5,
};

// Bottom line in diatonic indices, C0 = 0.
const BOTTOM: Record<Clef, number> = {
  treble: 30, // E4
  bass: 18, // G2
  alto: 24, // F3
  tenor: 22, // D3
};

function signatureAlteration(key: MajorKey, letter: Letter): number {
  const fifths = MAJOR_KEYS.indexOf(key) - 7;

  const order = fifths >= 0 ? SHARPS : FLATS;
  const position = order.indexOf(letter);

  return position >= 0 && position < Math.abs(fifths) ? Math.sign(fifths) : 0;
}

function tonicPitch(key: MajorKey, type: ScaleType): Letter {
  const first = key[0] as Letter;

  return LETTERS[(LETTERS.indexOf(first) + MODE_OFFSET[type]) % 7];
}

function tonicName(key: MajorKey, type: ScaleType): string {
  const letter = tonicPitch(key, type);
  const change = signatureAlteration(key, letter);

  const accidental: AccidentalType =
    change === 1 ? "sharp" : change === -1 ? "flat" : "none";

  // Croatian B = B-flat, H = B-natural.
  const name =
    letter === "B" && change === -1 ? "b" : noteName({ letter, accidental });

  return type === "major" ? name[0].toUpperCase() + name.slice(1) : name;
}

function alteredSign(change: number): AccidentalType {
  switch (change) {
    case 0:
      return "natural";
    case 1:
      return "sharp";
    case 2:
      return "double-sharp";
    default:
      throw new Error("Unsupported scale alteration");
  }
}

export function buildScaleQuestion(
  keySignature: MajorKey,
  type: ScaleType,
  clef: Clef,
): ScaleQuestion {
  const tonicLetter = tonicPitch(keySignature, type);

  const letterIndex = LETTERS.indexOf(tonicLetter);

  // Choose the octave closest to the bottom of the staff,
  // so the entire ascending scale remains reasonably centred.
  const startOctave = Math.round((BOTTOM[clef] - letterIndex) / 7);

  const startIndex = startOctave * 7 + letterIndex;

  const notes = Array.from({ length: 8 }, (_, step): ScaleNote => {
    const pitch = indexToPitch(startIndex + step);

    let accidental: AccidentalType = "none";

    // Harmonic minor: raised seventh.
    // Ascending melodic minor: raised sixth and seventh.
    if (
      (type === "minor-harmonic" && step === 6) ||
      (type === "minor-melodic" && (step === 5 || step === 6))
    ) {
      accidental = alteredSign(
        signatureAlteration(keySignature, pitch.letter) + 1,
      );
    }

    return { ...pitch, accidental };
  });

  return {
    type,
    tonic: tonicName(keySignature, type),
    keySignature,
    clef,
    notes,
  };
}

function allowedTypes(settings: Settings): readonly ScaleType[] {
  return settings.scaleLevel === "basic"
    ? ["major", "minor-natural"]
    : SCALE_TYPES;
}

export function generateScaleQuestion(
  settings: Settings,
  previous?: ScaleQuestion,
): ScaleQuestion {
  const clefs: readonly Clef[] =
    settings.clef === "random"
      ? CLEFS
      : settings.clef === "treble-bass"
        ? ["treble", "bass"]
        : [settings.clef];

  const pool = MAJOR_KEYS.flatMap((keySignature) =>
    allowedTypes(settings).flatMap((type) =>
      clefs.map((clef) => buildScaleQuestion(keySignature, type, clef)),
    ),
  );

  const choices = previous
    ? pool.filter(
        (question) =>
          question.type !== previous.type ||
          question.keySignature !== previous.keySignature ||
          question.clef !== previous.clef,
      )
    : pool;

  return choices[Math.floor(Math.random() * choices.length)];
}

const NAMES: Record<ScaleType, string> = {
  major: "dur",
  "minor-natural": "prirodni",
  "minor-harmonic": "harmonijski",
  "minor-melodic": "melodijski",
};

export function scaleAnswerLabel(question: ScaleQuestion): string {
  if (question.type === "major") {
    return `${question.tonic}-dur`;
  }

  return `${question.tonic}-mol (${NAMES[question.type]})`;
}

const normalize = (value: string): string =>
  value
    .normalize("NFC")
    .toLocaleLowerCase("hr-HR")
    .replace(/[^\p{L}\p{N}]/gu, "");

function aliases(
  question: ScaleQuestion,
  level: Settings["scaleLevel"],
): string[] {
  const tonic = normalize(question.tonic);

  if (question.type === "major") {
    return [`${tonic}dur`];
  }

  const kind = NAMES[question.type];

  return [
    `${tonic}mol${kind}`,
    `${tonic}${kind}mol`,
    ...(question.type === "minor-natural" && level === "basic"
      ? [`${tonic}mol`]
      : []),
  ];
}

export function checkScaleAnswer(
  raw: string,
  question: ScaleQuestion,
  settings: Settings,
): AnswerResult {
  const input = normalize(raw);

  // A valid answer for another scale is incorrect,
  // not a formatting error.
  const valid = new Set(
    MAJOR_KEYS.flatMap((key) =>
      allowedTypes(settings).flatMap((type) =>
        aliases(buildScaleQuestion(key, type, "treble"), settings.scaleLevel),
      ),
    ),
  );

  if (!valid.has(input)) return "invalid";

  return aliases(question, settings.scaleLevel).includes(input)
    ? "correct"
    : "incorrect";
}
