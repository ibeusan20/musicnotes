import type { Question } from "./music";
import type { PracticeQuestion } from "./exercises";
import { buildScaleQuestion, soundingScaleNotes } from "./scales";

export interface PlaybackEvent {
  notes: readonly Question[];
  start: number; // Seconds from playback start.
  duration: number; // Seconds.
}

export function practicePlaybackEvents(
  question: PracticeQuestion,
): PlaybackEvent[] {
  switch (question.kind) {
    case "note":
      return [
        {
          notes: [question.value],
          start: 0,
          duration: 1.8,
        },
      ];

    case "interval":
      return [
        {
          notes: [question.value.first],
          start: 0,
          duration: 0.65,
        },
        {
          notes: [question.value.second],
          start: 0.75,
          duration: 1.1,
        },
      ];

    case "chord":
      return [
        {
          notes: question.value.notes,
          start: 0,
          duration: 1.8,
        },
      ];

    case "scale": {
      const ascending = soundingScaleNotes(question.value);

      // Melodic minor descends as natural minor.
      // Other scales and modes retain their intervals.
      const descending =
        question.value.type === "minor-melodic"
          ? soundingScaleNotes(
              buildScaleQuestion(
                question.value.keySignature,
                "minor-natural",
                question.value.clef,
              ),
            )
          : ascending;

      // 8 ascending + 7 descending notes.
      // Do not repeat the highest tonic.
      const notes = [...ascending, ...descending.slice(0, -1).reverse()];

      return notes.map((note, index) => ({
        notes: [note],
        start: index * 0.43,
        duration: index === notes.length - 1 ? 0.85 : 0.38,
      }));
    }

    case "key-signature":
      return [];
  }
}
