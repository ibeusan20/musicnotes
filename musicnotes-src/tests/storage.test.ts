import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/domain/music";
import { loadStoredData, saveStoredData } from "../src/lib/storage";
import { createDefaultProfiles } from "../src/domain/practice";

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
  it("loads default profiles", () => {
    vi.stubGlobal("localStorage", createStorage());

    const loaded = loadStoredData();

    expect(loaded.mode).toBe("notes");
    expect(loaded.profiles.notes.settings).toEqual(DEFAULT_SETTINGS);
    expect(loaded.profiles.intervals.total.correct).toBe(0);
  });

  it("persists independent profiles", () => {
    vi.stubGlobal("localStorage", createStorage());

    const profiles = createDefaultProfiles();

    profiles.notes.settings.clef = "bass";
    profiles.intervals.settings.clef = "tenor";
    profiles.notes.total.correct = 12;
    profiles.intervals.total.correct = 3;

    const data = {
      mode: "intervals" as const,
      profiles,
      legacyTotal: null,
    };

    saveStoredData(data);

    expect(loadStoredData()).toEqual(data);
  });

  it("archives v1 statistics without misattribution", () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);

    storage.setItem(
      "musicnotes.v1",
      JSON.stringify({
        version: 1,
        settings: {
          ...DEFAULT_SETTINGS,
          practiceMode: "intervals",
          clef: "bass",
        },
        total: {
          correct: 42,
          incorrect: 8,
          bestStreak: 12,
        },
      }),
    );

    const migrated = loadStoredData();

    expect(migrated.mode).toBe("intervals");
    expect(migrated.profiles.notes.settings.clef).toBe("bass");
    expect(migrated.profiles.intervals.settings.clef).toBe("bass");

    expect(migrated.profiles.notes.total.correct).toBe(0);
    expect(migrated.profiles.intervals.total.correct).toBe(0);

    expect(migrated.legacyTotal).toEqual({
      correct: 42,
      incorrect: 8,
      bestStreak: 12,
    });

    saveStoredData(migrated);

    expect(loadStoredData()).toEqual(migrated);
    expect(storage.getItem("musicnotes.v1")).not.toBeNull();
  });

  it("handles invalid JSON", () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);

    storage.setItem("musicnotes.v2", "{broken");

    expect(loadStoredData().mode).toBe("notes");
  });

  it("continues when storage is blocked", () => {
    vi.stubGlobal("localStorage", {
      getItem() {
        throw new Error("Storage blocked");
      },
      setItem() {
        throw new Error("Storage blocked");
      },
    });

    expect(loadStoredData().mode).toBe("notes");

    expect(() =>
      saveStoredData({
        mode: "notes",
        profiles: createDefaultProfiles(),
        legacyTotal: null,
      }),
    ).not.toThrow();
  });
});
