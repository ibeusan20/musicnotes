// Discriminate union between note and interval questions - storred in the same practice question pool.

import { generateQuestion, type Question, type Settings } from "./music";
import { generateIntervalQuestion, type IntervalQuestion } from "./intervals";
import { generateScaleQuestion, type ScaleQuestion } from "./scales";

export type PracticeQuestion =
  | { kind: "note"; value: Question }
  | { kind: "interval"; value: IntervalQuestion }
  | { kind: "scale"; value: ScaleQuestion };

export function generatePracticeQuestion(
  settings: Settings,
  previous?: PracticeQuestion,
): PracticeQuestion {
  if (settings.practiceMode === "notes") {
    return {
      kind: "note",
      value: generateQuestion(
        settings,
        previous?.kind === "note" ? previous.value : undefined,
      ),
    };
  }

  if (settings.practiceMode === "intervals") {
    return {
      kind: "interval",
      value: generateIntervalQuestion(
        settings,
        previous?.kind === "interval" ? previous.value : undefined,
      ),
    };
  }

  return {
    kind: "scale",
    value: generateScaleQuestion(
      settings,
      previous?.kind === "scale" ? previous.value : undefined,
    ),
  };
}
