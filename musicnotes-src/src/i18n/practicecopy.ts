import type { PracticeMode } from "../domain/music";
import type { TranslationKey } from "./translations";

interface PracticeCopy {
  heading: TranslationKey;
  question: TranslationKey;
  instruction: TranslationKey;
  placeholder: TranslationKey;
  waiting: TranslationKey;
  hint: TranslationKey;
  invalid: TranslationKey;
}

export const PRACTICE_COPY = {
  notes: {
    heading: "practiceLabel",
    question: "question",
    instruction: "staffInstruction",
    placeholder: "placeholderLetter",
    waiting: "waiting",
    hint: "notationHint",
    invalid: "invalidLetter",
  },

  intervals: {
    heading: "intervalPracticeLabel",
    question: "intervalQuestion",
    instruction: "staffInstructionInterval",
    placeholder: "placeholderInterval",
    waiting: "waitingInterval",
    hint: "intervalHint",
    invalid: "invalidInterval",
  },

  scales: {
    heading: "scalePracticeLabel",
    question: "scaleQuestion",
    instruction: "staffInstructionScale",
    placeholder: "placeholderScale",
    waiting: "waitingScale",
    hint: "scaleHint",
    invalid: "invalidScale",
  },

  modes: {
    heading: "modePracticeLabel",
    question: "modeQuestion",
    instruction: "staffInstructionMode",
    placeholder: "placeholderMode",
    waiting: "waitingMode",
    hint: "modeHint",
    invalid: "invalidScale",
  },

  chords: {
    heading: "chordPracticeLabel",
    question: "chordQuestion",
    instruction: "staffInstructionChord",
    placeholder: "placeholderChord",
    waiting: "waitingChord",
    hint: "chordHint",
    invalid: "invalidChord",
  },
} satisfies Record<PracticeMode, PracticeCopy>;
