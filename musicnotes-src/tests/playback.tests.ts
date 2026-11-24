import { describe, expect, it } from "vitest";
import { midiNumber } from "../src/domain/audio";
import type { Question } from "../src/domain/music";
import { buildChordQuestion } from "../src/domain/chords";
import { buildScaleQuestion } from "../src/domain/scales";
import { practicePlaybackEvents } from "../src/domain/playback";

const C4: Question = {
  letter: "C",
  octave: 4,
  clef: "treble",
  accidental: "none",
};

describe("Exercise playback", () => {
  it("plays a single note", () => {
    const events = practicePlaybackEvents({
      kind: "note",
      value: C4,
    });

    expect(events).toHaveLength(1);
    expect(events[0].start).toBe(0);
    expect(events[0].duration).toBe(1.8);
    expect(events[0].notes).toEqual([C4]);
  });

  it("plays interval notes sequentially", () => {
    const events = practicePlaybackEvents({
      kind: "interval",
      value: {
        first: C4,
        second: { ...C4, letter: "G" },
      },
    });

    expect(events).toHaveLength(2);
    expect(events[0].start + events[0].duration).toBeLessThan(events[1].start);

    expect(
      midiNumber(events[1].notes[0]) - midiNumber(events[0].notes[0]),
    ).toBe(7);
  });

  it("plays all chord tones simultaneously", () => {
    const chord = buildChordQuestion("dominant", 1, C4)!;

    const events = practicePlaybackEvents({
      kind: "chord",
      value: chord,
    });

    expect(events).toHaveLength(1);
    expect(events[0].notes).toHaveLength(4);

    expect(events[0].notes.map(midiNumber)).toEqual(
      chord.notes.map(midiNumber),
    );
  });

  it("applies the G major key signature", () => {
    const events = practicePlaybackEvents({
      kind: "scale",
      value: buildScaleQuestion("G", "major", "treble"),
    });

    expect(events).toHaveLength(8);
    expect(events[6].notes[0].letter).toBe("F");
    expect(events[6].notes[0].accidental).toBe("sharp");
  });

  it("respects explicit naturals in harmonic minor", () => {
    const events = practicePlaybackEvents({
      kind: "scale",
      value: buildScaleQuestion("Cb", "minor-harmonic", "treble"),
    });

    expect(events[6].notes[0].accidental).toBe("natural");
  });

  it("respects double sharps", () => {
    const events = practicePlaybackEvents({
      kind: "scale",
      value: buildScaleQuestion("B", "minor-harmonic", "treble"),
    });

    expect(events[6].notes[0].accidental).toBe("double-sharp");
  });

  it("plays all eight notes of a diatonic mode", () => {
    const events = practicePlaybackEvents({
      kind: "scale",
      value: buildScaleQuestion("G", "dorian", "bass"),
    });

    expect(events).toHaveLength(8);

    for (let index = 1; index < events.length; index++) {
      expect(events[index].start).toBeGreaterThan(events[index - 1].start);
      expect(midiNumber(events[index].notes[0])).toBeGreaterThan(
        midiNumber(events[index - 1].notes[0]),
      );
    }
  });
});
