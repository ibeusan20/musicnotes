import { describe, expect, it } from "vitest";

import {
  diatonicIndex,
  indexToPitch,
  selectedClefs,
} from "../src/domain/music";

describe("Shared music helpers", () => {
  it("resolves all clef selections", () => {
    expect(selectedClefs("treble")).toEqual(["treble"]);
    expect(selectedClefs("bass")).toEqual(["bass"]);
    expect(selectedClefs("treble-bass")).toEqual(["treble", "bass"]);
    expect(selectedClefs("random")).toEqual([
      "treble",
      "bass",
      "alto",
      "tenor",
    ]);
  });

  it("converts diatonic positions in both directions", () => {
    for (let index = 0; index <= 70; index++) {
      expect(diatonicIndex(indexToPitch(index))).toBe(index);
    }
  });

  it("preserves octave boundaries", () => {
    expect(diatonicIndex({ letter: "B", octave: 3 })).toBe(27);
    expect(diatonicIndex({ letter: "C", octave: 4 })).toBe(28);
  });
});
