import {
  selectedClefs,
  type Clef,
  type KeyLevel,
  type Settings,
} from "./music";

import { MAJOR_KEYS, buildScaleQuestion, type MajorKey } from "./scales";

import type { AnswerResult } from "./quiz";

export type KeyQuality = Exclude<KeyLevel, "mixed">;

export interface KeySignatureQuestion {
  keySignature: MajorKey;
  quality: KeyQuality;
  clef: Clef;
}

function allowedQualities(level: KeyLevel): readonly KeyQuality[] {
  return level === "mixed" ? ["major", "minor"] : [level];
}

/**
 * Each key signature belongs to a relative major/minor pair.
 * The question explicitly selects which quality to identify.
 */
export function generateKeySignatureQuestion(
  settings: Settings,
  previous?: KeySignatureQuestion,
): KeySignatureQuestion {
  const clefs = selectedClefs(settings.clef);
  const qualities = allowedQualities(settings.keyLevel);

  const pool = MAJOR_KEYS.flatMap((keySignature) =>
    qualities.flatMap((quality) =>
      clefs.map((clef) => ({
        keySignature,
        quality,
        clef,
      })),
    ),
  );

  const candidates = previous
    ? pool.filter(
        (question) =>
          question.keySignature !== previous.keySignature ||
          question.quality !== previous.quality ||
          question.clef !== previous.clef,
      )
    : pool;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Reuse the existing scale model to determine the tonic.
 */
function tonicName(question: KeySignatureQuestion): string {
  const type = question.quality === "major" ? "major" : "minor-natural";

  return buildScaleQuestion(question.keySignature, type, question.clef).tonic;
}

export function keyAnswerLabel(question: KeySignatureQuestion): string {
  const tonic = tonicName(question);
  const suffix = question.quality === "major" ? "dur" : "mol";

  return `${tonic}-${suffix}`;
}

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("hr-HR")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function answerAliases(question: KeySignatureQuestion): string[] {
  const tonic = tonicName(question).toLocaleLowerCase("hr-HR");
  const names = tonic === "b" ? ["b", "hes"] : [tonic];
  const suffix = question.quality === "major" ? "dur" : "mol";

  return names.map((name) => normalize(`${name}-${suffix}`));
}

const VALID_ANSWERS: ReadonlySet<string> = new Set(
  MAJOR_KEYS.flatMap((keySignature) =>
    (["major", "minor"] as const).flatMap((quality) =>
      answerAliases({
        keySignature,
        quality,
        clef: "treble",
      }),
    ),
  ),
);

export function checkKeyAnswer(
  raw: string,
  question: KeySignatureQuestion,
): AnswerResult {
  const input = normalize(raw);

  if (!VALID_ANSWERS.has(input)) {
    return "invalid";
  }

  return answerAliases(question).includes(input) ? "correct" : "incorrect";
}
