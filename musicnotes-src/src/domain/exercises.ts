import {
  generateQuestion,
  noteLabel,
  type Clef,
  type Question,
  type Settings,
} from "./music";

import {
  checkIntervalAnswer,
  generateIntervalQuestion,
  identifyInterval,
  type IntervalQuestion,
} from "./intervals";

import {
  checkScaleAnswer,
  generateScaleQuestion,
  scaleAnswerLabel,
  type ScaleQuestion,
} from "./scales";

import {
  checkChordAnswer,
  generateChordQuestion,
  identifyChord,
  type ChordQuestion,
} from "./chords";

import { checkAnswer, type AnswerResult } from "./quiz";

export type PracticeQuestion =
  | { kind: "note"; value: Question }
  | { kind: "interval"; value: IntervalQuestion }
  | { kind: "scale"; value: ScaleQuestion }
  | { kind: "chord"; value: ChordQuestion };

export function generatePracticeQuestion(
  settings: Settings,
  previous?: PracticeQuestion,
): PracticeQuestion {
  switch (settings.practiceMode) {
    case "notes":
      return {
        kind: "note",
        value: generateQuestion(
          settings,
          previous?.kind === "note" ? previous.value : undefined,
        ),
      };

    case "intervals":
      return {
        kind: "interval",
        value: generateIntervalQuestion(
          settings,
          previous?.kind === "interval" ? previous.value : undefined,
        ),
      };

    case "chords":
      return {
        kind: "chord",
        value: generateChordQuestion(
          settings,
          previous?.kind === "chord" ? previous.value : undefined,
        ),
      };

    case "scales":
    case "modes":
      return {
        kind: "scale",
        value: generateScaleQuestion(
          settings,
          previous?.kind === "scale" ? previous.value : undefined,
        ),
      };
  }
}

export function practiceAnswerLabel(
  question: PracticeQuestion,
  settings: Settings,
): string {
  switch (question.kind) {
    case "note":
      return noteLabel(question.value, settings.answerMode === "letter-octave");

    case "interval":
      return identifyInterval(question.value) ?? "";

    case "scale":
      return scaleAnswerLabel(question.value);

    case "chord":
      return identifyChord(question.value) ?? "";
  }
}

export function checkPracticeAnswer(
  answer: string,
  question: PracticeQuestion,
  settings: Settings,
): AnswerResult {
  switch (question.kind) {
    case "note":
      return checkAnswer(answer, question.value, settings.answerMode);

    case "interval":
      return checkIntervalAnswer(answer, question.value);

    case "scale":
      return checkScaleAnswer(answer, question.value, settings);

    case "chord":
      return checkChordAnswer(answer, question.value);
  }
}

export function practiceQuestionClef(question: PracticeQuestion): Clef {
  switch (question.kind) {
    case "note":
      return question.value.clef;

    case "interval":
      return question.value.first.clef;

    case "scale":
    case "chord":
      return question.value.clef;
  }
}
