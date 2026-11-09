import { afterEach, describe, expect, it, vi } from "vitest";

import {
  UI_STORAGE_KEY,
  defaultUiPreferences,
  loadUiPreferences,
  resolveTheme,
  saveUiPreferences,
} from "../src/lib/uiPreferences";

function createStorage(): Storage {
  const items = new Map<string, string>();

  return {
    get length() {
      return items.size;
    },
    clear() {
      items.clear();
    },
    getItem(key) {
      return items.get(key) ?? null;
    },
    key(index) {
      return [...items.keys()][index] ?? null;
    },
    removeItem(key) {
      items.delete(key);
    },
    setItem(key, value) {
      items.set(key, value);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("UI preferences", () => {
  it("defaults to the system theme", () => {
    vi.stubGlobal("navigator", {
      language: "hr-HR",
    });

    expect(defaultUiPreferences()).toEqual({
      language: "hr",
      theme: "system",
    });
  });

  it("detects English browsers", () => {
    vi.stubGlobal("navigator", {
      language: "en-US",
    });

    expect(defaultUiPreferences().language).toBe("en");
  });

  it("saves and restores preferences", () => {
    vi.stubGlobal("localStorage", createStorage());

    const value = {
      language: "en",
      theme: "light",
    } as const;

    saveUiPreferences(value);

    expect(loadUiPreferences()).toEqual(value);
  });

  it("does not overwrite quiz statistics", () => {
    const storage = createStorage();

    vi.stubGlobal("localStorage", storage);

    storage.setItem("musicnotes.v1", "existing-quiz-data");

    saveUiPreferences({
      language: "en",
      theme: "dark",
    });

    expect(storage.getItem("musicnotes.v1")).toBe("existing-quiz-data");
  });

  it("handles invalid saved data", () => {
    vi.stubGlobal("navigator", {
      language: "hr-HR",
    });

    const storage = createStorage();

    vi.stubGlobal("localStorage", storage);

    storage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({
        language: "xyz",
        theme: "purple",
      }),
    );

    expect(loadUiPreferences()).toEqual({
      language: "hr",
      theme: "system",
    });

    storage.setItem(UI_STORAGE_KEY, "{bad json");

    expect(loadUiPreferences()).toEqual({
      language: "hr",
      theme: "system",
    });
  });

  it("survives blocked storage", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });

    expect(loadUiPreferences().theme).toBe("system");

    expect(() =>
      saveUiPreferences({
        language: "hr",
        theme: "dark",
      }),
    ).not.toThrow();
  });
});

describe("Theme resolution", () => {
  it.each([
    ["system", true, "dark"],
    ["system", false, "light"],
    ["dark", false, "dark"],
    ["light", true, "light"],
  ] as const)("%s + OS dark=%s -> %s", (setting, systemIsDark, expected) => {
    expect(resolveTheme(setting, systemIsDark)).toBe(expected);
  });
});
