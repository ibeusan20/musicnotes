import { describe, expect, it } from "vitest";
import { translations } from "../src/i18n/translations";

describe("Translations", () => {
  it("provides the same keys in both languages", () => {
    expect(Object.keys(translations.en).sort()).toEqual(
      Object.keys(translations.hr).sort(),
    );
  });

  it("has no empty translations", () => {
    for (const dictionary of Object.values(translations)) {
      for (const value of Object.values(dictionary)) {
        expect(value.trim()).not.toBe("");
      }
    }
  });
});
