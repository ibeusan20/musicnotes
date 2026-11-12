import type { PracticeMode } from "../domain/music";
import type { TranslationKey } from "./translations";

interface PracticeCopy {
  heading: TranslationKey;
  question: TranslationKey;
  instruction: TranslationKey;
  placeholder: TranslationKey;
  waiting: TranslationKey;
  hint: TranslationKey;
}

export const PRACTICE_COPY = {
  notes: {
    heading: "practiceLabel",
    question: "question",
    instruction: "staffInstruction",
    placeholder: "placeholderLetter",
    waiting: "waiting",
    hint: "notationHint",
  },

  intervals: {
    heading: "intervalPracticeLabel",
    question: "intervalQuestion",
    instruction: "staffInstructionInterval",
    placeholder: "placeholderInterval",
    waiting: "waitingInterval",
    hint: "intervalHint",
  },

  scales: {
    heading: "scalePracticeLabel",
    question: "scaleQuestion",
    instruction: "staffInstructionScale",
    placeholder: "placeholderScale",
    waiting: "waitingScale",
    hint: "scaleHint",
  },

  modes: {
    heading: "modePracticeLabel",
    question: "modeQuestion",
    instruction: "staffInstructionMode",
    placeholder: "placeholderMode",
    waiting: "waitingMode",
    hint: "modeHint",
  },
} satisfies Record<PracticeMode, PracticeCopy>;
