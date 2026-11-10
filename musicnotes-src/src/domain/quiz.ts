import {
  LETTERS,
  expectedAnswer,
  noteName,
  type AnswerMode,
  type Question,
  ACCIDENTALS,
} from "./music";

export type AnswerResult = "invalid" | "correct" | "incorrect";

// Single source of truth for all valid names.
const VALID_NAMES = new Set(
  LETTERS.flatMap((letter) =>
    ACCIDENTALS.map((accidental) => noteName({ letter, accidental })),
  ),
);

function normalizeAnswer(raw: string, mode: AnswerMode): string | null {
  const input = raw.trim().toLowerCase().replace(/\s+/g, "");

  const match =
    mode === "letter"
      ? /^([a-z]+)$/.exec(input)
      : /^([a-z]+)([0-8])$/.exec(input);

  if (!match) return null;

  // B is an alternative name for H♭.
  const name = match[1] === "b" ? "hes" : match[1];

  if (!VALID_NAMES.has(name)) {
    return null;
  }

  return `${name}${match[2] ?? ""}`;
}

export function checkAnswer(
  raw: string,
  question: Question,
  mode: AnswerMode,
): AnswerResult {
  const normalized = normalizeAnswer(raw, mode);

  if (normalized === null) {
    return "invalid";
  }

  return normalized === expectedAnswer(question, mode)
    ? "correct"
    : "incorrect";
}
