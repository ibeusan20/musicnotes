import type { AnswerMode, Question } from "./music";
import { expectedAnswer } from "./music";

export type AnswerResult = "invalid" | "correct" | "incorrect";

export function checkAnswer(
  raw: string,
  question: Question,
  mode: AnswerMode,
): AnswerResult {
  const answer = raw.trim().toUpperCase().replace(/\s+/g, "");

  // Only Croatian names of natural notes. B natural is represented as H in Croatian notation.
  const pattern = mode === "letter" ? /^[CDEFGAH]$/ : /^[CDEFGAH][0-8]$/;

  if (!pattern.test(answer)) {
    return "invalid";
  }

  return answer === expectedAnswer(question, mode) ? "correct" : "incorrect";
}
