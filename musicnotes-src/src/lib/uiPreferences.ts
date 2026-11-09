import type { Language } from "../i18n/translations";

export type ThemeSetting = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export interface UiPreferences {
  language: Language;
  theme: ThemeSetting;
}

export const UI_STORAGE_KEY = "musicnotes.ui.v1";

export function defaultUiPreferences(): UiPreferences {
  const language =
    typeof navigator !== "undefined" &&
    navigator.language.toLowerCase().startsWith("en")
      ? "en"
      : "hr";

  return { language, theme: "system" };
}

export function loadUiPreferences(): UiPreferences {
  const fallback = defaultUiPreferences();

  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) return fallback;

    const value: unknown = JSON.parse(raw);

    if (typeof value !== "object" || value === null) {
      return fallback;
    }

    const saved = value as Record<string, unknown>;

    return {
      language:
        saved.language === "hr" || saved.language === "en"
          ? saved.language
          : fallback.language,

      theme:
        saved.theme === "system" ||
        saved.theme === "light" ||
        saved.theme === "dark"
          ? saved.theme
          : fallback.theme,
    };
  } catch {
    return fallback;
  }
}

export function saveUiPreferences(preferences: UiPreferences): void {
  try {
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Preferences still work for the current session.
  }
}

export function resolveTheme(
  theme: ThemeSetting,
  prefersDark: boolean,
): ResolvedTheme {
  return theme === "system" ? (prefersDark ? "dark" : "light") : theme;
}
