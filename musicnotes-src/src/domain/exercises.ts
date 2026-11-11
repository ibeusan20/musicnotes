// Discriminate union between note and interval questions - storred in the same practice question pool.

import { generateQuestion, type Question, type Settings } from "./music";
import { generateIntervalQuestion, type IntervalQuestion } from "./intervals";

export type PracticeQuestion =
  | { kind: "note"; value: Question }
  | { kind: "interval"; value: IntervalQuestion };

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

  return {
    kind: "interval",
    value: generateIntervalQuestion(
      settings,
      previous?.kind === "interval" ? previous.value : undefined,
    ),
  };
}
