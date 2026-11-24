import {
  DEFAULT_SETTINGS,
  PRACTICE_MODES,
  type PracticeMode,
  type Settings,
} from "../domain/music";

import { createDefaultProfiles, type ModeProfiles } from "../domain/practice";
import { emptyTotal, type TotalStats } from "../domain/statistics";

const OLD_KEY = "musicnotes.v1";
const STORAGE_KEY = "musicnotes.v2";

export interface StoredData {
  mode: PracticeMode;
  profiles: ModeProfiles;
  legacyTotal: TotalStats | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validMode(value: unknown): value is PracticeMode {
  return (
    typeof value === "string" && PRACTICE_MODES.some((mode) => mode === value)
  );
}

function nonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : 0;
}

function parseTotal(value: unknown): TotalStats {
  if (!isRecord(value)) return emptyTotal();

  const correct = nonNegativeInteger(value.correct);

  return {
    correct,
    incorrect: nonNegativeInteger(value.incorrect),
    bestStreak: Math.min(correct, nonNegativeInteger(value.bestStreak)),
  };
}

function parseSettings(value: unknown, mode: PracticeMode): Settings {
  const fallback: Settings = {
    ...DEFAULT_SETTINGS,
    practiceMode: mode,
  };

  if (!isRecord(value)) {
    return fallback;
  }

  return {
    practiceMode: mode,

    clef: parseOption(value.clef, VALID_SETTINGS.clef, fallback.clef),

    difficulty: parseOption(
      value.difficulty,
      VALID_SETTINGS.difficulty,
      fallback.difficulty,
    ),

    answerMode: parseOption(
      value.answerMode,
      VALID_SETTINGS.answerMode,
      fallback.answerMode,
    ),

    accidentalLevel: parseOption(
      value.accidentalLevel,
      VALID_SETTINGS.accidentalLevel,
      fallback.accidentalLevel,
    ),

    intervalLevel: parseOption(
      value.intervalLevel,
      VALID_SETTINGS.intervalLevel,
      fallback.intervalLevel,
    ),

    scaleLevel: parseOption(
      value.scaleLevel,
      VALID_SETTINGS.scaleLevel,
      fallback.scaleLevel,
    ),

    chordLevel: parseOption(
      value.chordLevel,
      VALID_SETTINGS.chordLevel,
      fallback.chordLevel,
    ),

    keyLevel: parseOption(
      value.keyLevel,
      VALID_SETTINGS.keyLevel,
      fallback.keyLevel,
    ),
  };
}

export function loadStoredData(): StoredData {
  const fallback: StoredData = {
    mode: "notes",
    profiles: createDefaultProfiles(),
    legacyTotal: null,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      let data: unknown = null;

      try {
        data = JSON.parse(raw);
      } catch {
        // Attempt migration from v1 below.
      }

      if (isRecord(data) && data.version === 2) {
        const profiles = createDefaultProfiles();

        const sources = isRecord(data.profiles) ? data.profiles : {};

        for (const mode of PRACTICE_MODES) {
          const source = sources[mode];

          if (isRecord(source)) {
            profiles[mode] = {
              settings: parseSettings(source.settings, mode),
              total: parseTotal(source.total),
            };
          }
        }

        return {
          mode: validMode(data.mode) ? data.mode : "notes",
          profiles,
          legacyTotal:
            data.legacyTotal === null
              ? null
              : isRecord(data.legacyTotal)
                ? parseTotal(data.legacyTotal)
                : null,
        };
      }
    }

    // One-time migration from the old shared statistics.
    const old = localStorage.getItem(OLD_KEY);

    if (!old) return fallback;

    const data: unknown = JSON.parse(old);

    if (!isRecord(data) || data.version !== 1) {
      return fallback;
    }

    const oldSettings = isRecord(data.settings) ? data.settings : {};
    const mode = validMode(oldSettings.practiceMode)
      ? oldSettings.practiceMode
      : "notes";

    const profiles = createDefaultProfiles();

    for (const entry of PRACTICE_MODES) {
      profiles[entry].settings = parseSettings(oldSettings, entry);
    }

    return {
      mode,
      profiles,
      legacyTotal: parseTotal(data.total),
    };
  } catch {
    return fallback;
  }
}

const VALID_SETTINGS = {
  clef: ["treble", "bass", "alto", "tenor", "treble-bass", "random"],

  difficulty: ["basic", "extended", "advanced"],
  answerMode: ["letter", "letter-octave"],
  accidentalLevel: ["off", "single", "double"],
  intervalLevel: ["common", "all"],
  scaleLevel: ["basic", "all"],
  chordLevel: ["basic", "triads", "sevenths", "all"],
  keyLevel: ["major", "minor", "mixed"],
} as const satisfies {
  [K in Exclude<keyof Settings, "practiceMode">]: readonly Settings[K][];
};

function parseOption<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" && allowed.some((option) => option === value)
    ? (value as T)
    : fallback;
}

export function saveStoredData(data: StoredData): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        ...data,
      }),
    );
  } catch {
    // The application continues without local storage.
  }
}
