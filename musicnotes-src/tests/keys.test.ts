import { describe, expect, it } from "vitest";
import { CLEFS, DEFAULT_SETTINGS } from "../src/domain/music";
import { MAJOR_KEYS } from "../src/domain/scales";

import {
  checkKeyAnswer,
  generateKeySignatureQuestion,
  keyAnswerLabel,
  type KeyQuality,
  type KeySignatureQuestion,
} from "../src/domain/keys";

function question(
  keySignature: (typeof MAJOR_KEYS)[number],
  quality: KeyQuality,
): KeySignatureQuestion {
  return {
    keySignature,
    quality,
    clef: "treble",
  };
}

describe("Key signature recognition", () => {
  it("supports 15 major and 15 relative minor keys", () => {
    expect(MAJOR_KEYS).toHaveLength(15);

    const labels = MAJOR_KEYS.flatMap((key) => [
      keyAnswerLabel(question(key, "major")),
      keyAnswerLabel(question(key, "minor")),
    ]);

    expect(labels).toHaveLength(30);
    expect(new Set(labels).size).toBe(30);
  });

  it.each([
    ["C", "major", "C-dur"],
    ["C", "minor", "a-mol"],
    ["G", "major", "G-dur"],
    ["G", "minor", "e-mol"],
    ["F", "major", "F-dur"],
    ["F", "minor", "d-mol"],
    ["Bb", "major", "B-dur"],
    ["Bb", "minor", "g-mol"],
    ["B", "major", "H-dur"],
    ["B", "minor", "gis-mol"],
    ["Db", "minor", "b-mol"],
    ["C#", "major", "Cis-dur"],
    ["C#", "minor", "ais-mol"],
    ["Cb", "major", "Ces-dur"],
    ["Cb", "minor", "as-mol"],
  ] as const)("identifies %s %s as %s", (key, quality, expected) => {
    expect(keyAnswerLabel(question(key, quality))).toBe(expected);
  });

  it("accepts flexible Croatian input", () => {
    const major = question("G", "major");

    expect(checkKeyAnswer("G-dur", major)).toBe("correct");
    expect(checkKeyAnswer("g dur", major)).toBe("correct");
    expect(checkKeyAnswer("GDUR", major)).toBe("correct");
  });

  it("accepts B and Hes as B-flat", () => {
    const major = question("Bb", "major");
    const minor = question("Db", "minor");

    expect(checkKeyAnswer("B dur", major)).toBe("correct");
    expect(checkKeyAnswer("Hes-dur", major)).toBe("correct");
    expect(checkKeyAnswer("b mol", minor)).toBe("correct");
    expect(checkKeyAnswer("hes mol", minor)).toBe("correct");
  });

  it("distinguishes B-flat major from B-natural major", () => {
    expect(checkKeyAnswer("H-dur", question("Bb", "major"))).toBe("incorrect");
    expect(checkKeyAnswer("B-dur", question("B", "major"))).toBe("incorrect");
  });

  it("distinguishes major and relative minor", () => {
    const major = question("C", "major");
    const minor = question("C", "minor");

    expect(checkKeyAnswer("C dur", major)).toBe("correct");
    expect(checkKeyAnswer("a mol", major)).toBe("incorrect");
    expect(checkKeyAnswer("a mol", minor)).toBe("correct");
    expect(checkKeyAnswer("C dur", minor)).toBe("incorrect");
  });

  it("distinguishes invalid from incorrect answers", () => {
    const current = question("D", "major");

    expect(checkKeyAnswer("C dur", current)).toBe("incorrect");
    expect(checkKeyAnswer("nepostojeci", current)).toBe("invalid");
    expect(checkKeyAnswer("", current)).toBe("invalid");
  });

  it("respects major, minor and mixed settings", () => {
    for (const keyLevel of ["major", "minor", "mixed"] as const) {
      const settings = {
        ...DEFAULT_SETTINGS,
        practiceMode: "keys" as const,
        keyLevel,
      };

      for (let i = 0; i < 50; i++) {
        const current = generateKeySignatureQuestion(settings);

        expect(MAJOR_KEYS).toContain(current.keySignature);

        if (keyLevel !== "mixed") {
          expect(current.quality).toBe(keyLevel);
        } else {
          expect(["major", "minor"]).toContain(current.quality);
        }
      }
    }
  });

  it("supports all four clefs", () => {
    for (const clef of CLEFS) {
      const current = generateKeySignatureQuestion({
        ...DEFAULT_SETTINGS,
        practiceMode: "keys",
        clef,
      });

      expect(current.clef).toBe(clef);
    }
  });

  it("does not repeat the same question immediately", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      practiceMode: "keys" as const,
    };

    const previous = generateKeySignatureQuestion(settings);

    for (let i = 0; i < 50; i++) {
      const current = generateKeySignatureQuestion(settings, previous);

      expect(current).not.toEqual(previous);
    }
  });
});
