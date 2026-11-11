import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/domain/music";
import { loadStoredData, saveStoredData } from "../src/lib/storage";

function createStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },

    clear() {
      data.clear();
    },

    getItem(key) {
      return data.get(key) ?? null;
    },

    key(index) {
      return [...data.keys()][index] ?? null;
    },

    removeItem(key) {
      data.delete(key);
    },

    setItem(key, value) {
      data.set(key, value);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Lokalno spremanje", () => {
  it("vraća početne vrijednosti bez podataka", () => {
    vi.stubGlobal("localStorage", createStorage());

    expect(loadStoredData().settings).toEqual(DEFAULT_SETTINGS);
  });

  it("sprema i učitava nove postavke", () => {
    vi.stubGlobal("localStorage", createStorage());

    const settings = {
      ...DEFAULT_SETTINGS,
      clef: "tenor" as const,
      accidentalLevel: "double" as const,
    };

    const total = {
      correct: 12,
      incorrect: 4,
      bestStreak: 5,
    };

    saveStoredData(settings, total);

    expect(loadStoredData()).toEqual({
      settings,
      total,
    });
  });

  it("učitava stare postavke bez predznaka", () => {
    const storage = createStorage();

    vi.stubGlobal("localStorage", storage);

    storage.setItem(
      "musicnotes.v1",
      JSON.stringify({
        version: 1,
        settings: {
          clef: "treble",
          difficulty: "basic",
          answerMode: "letter",
        },
        total: {
          correct: 10,
          incorrect: 2,
          bestStreak: 4,
        },
      }),
    );

    const loaded = loadStoredData();

    expect(loaded.settings.accidentalLevel).toBe("off");
    expect(loaded.total.correct).toBe(10);
    expect(loaded.total.incorrect).toBe(2);
  });

  it("ne ruši aplikaciju zbog neispravnog JSON-a", () => {
    const storage = createStorage();

    vi.stubGlobal("localStorage", storage);

    storage.setItem("musicnotes.v1", "{broken");

    expect(loadStoredData().settings).toEqual(DEFAULT_SETTINGS);
  });

  it("nastavlja raditi ako je spremanje zabranjeno", () => {
    vi.stubGlobal("localStorage", {
      getItem() {
        throw new Error("Storage blocked");
      },
      setItem() {
        throw new Error("Storage blocked");
      },
    });

    expect(loadStoredData().settings).toEqual(DEFAULT_SETTINGS);

    expect(() =>
      saveStoredData(DEFAULT_SETTINGS, {
        correct: 0,
        incorrect: 0,
        bestStreak: 0,
      }),
    ).not.toThrow();
  });

  it("preserves old statistics and defaults to note mode", () => {
    const storage = createStorage();

    vi.stubGlobal("localStorage", storage);

    storage.setItem(
      "musicnotes.v1",
      JSON.stringify({
        version: 1,
        settings: {
          clef: "bass",
          difficulty: "extended",
          answerMode: "letter",
          accidentalLevel: "single",
        },
        total: {
          correct: 42,
          incorrect: 8,
          bestStreak: 12,
        },
      }),
    );

    const loaded = loadStoredData();

    expect(loaded.settings.practiceMode).toBe("notes");
    expect(loaded.settings.intervalLevel).toBe("common");

    expect(loaded.total).toEqual({
      correct: 42,
      incorrect: 8,
      bestStreak: 12,
    });
  });
});
