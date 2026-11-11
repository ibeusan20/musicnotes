import { DEFAULT_SETTINGS, type Settings } from "../domain/music";
import { emptyTotal, type TotalStats } from "../domain/statistics";

const STORAGE_KEY = "musicnotes.v1";

interface StoredData {
  version: 1;
  settings: Settings;
  total: TotalStats;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : 0;
}

function parseSettings(value: unknown): Settings {
  if (!isRecord(value)) {
    return { ...DEFAULT_SETTINGS };
  }

  const clef = value.clef;
  const difficulty = value.difficulty;
  const answerMode = value.answerMode;
  const accidentalLevel = value.accidentalLevel;
  const practiceMode = value.practiceMode;
  const intervalLevel = value.intervalLevel;

  return {
    clef:
      clef === "treble" ||
      clef === "bass" ||
      clef === "alto" ||
      clef === "tenor" ||
      clef === "treble-bass" ||
      clef === "random"
        ? clef
        : DEFAULT_SETTINGS.clef,

    difficulty:
      difficulty === "basic" ||
      difficulty === "extended" ||
      difficulty === "advanced"
        ? difficulty
        : DEFAULT_SETTINGS.difficulty,

    answerMode:
      answerMode === "letter" || answerMode === "letter-octave"
        ? answerMode
        : DEFAULT_SETTINGS.answerMode,

    accidentalLevel:
      accidentalLevel === "off" ||
      accidentalLevel === "single" ||
      accidentalLevel === "double"
        ? accidentalLevel
        : DEFAULT_SETTINGS.accidentalLevel,

    practiceMode:
      practiceMode === "notes" || practiceMode === "intervals"
        ? practiceMode
        : DEFAULT_SETTINGS.practiceMode,

    intervalLevel:
      intervalLevel === "common" || intervalLevel === "all"
        ? intervalLevel
        : DEFAULT_SETTINGS.intervalLevel,
  };
}

function parseTotal(value: unknown): TotalStats {
  if (!isRecord(value)) {
    return emptyTotal();
  }

  const correct = nonNegativeInteger(value.correct);

  return {
    correct,
    incorrect: nonNegativeInteger(value.incorrect),
    bestStreak: Math.min(correct, nonNegativeInteger(value.bestStreak)),
  };
}

export function loadStoredData(): {
  settings: Settings;
  total: TotalStats;
} {
  const fallback = {
    settings: { ...DEFAULT_SETTINGS },
    total: emptyTotal(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return fallback;

    const data: unknown = JSON.parse(raw);

    if (!isRecord(data) || data.version !== 1) {
      return fallback;
    }

    return {
      settings: parseSettings(data.settings),
      total: parseTotal(data.total),
    };
  } catch {
    return fallback;
  }
}

export function saveStoredData(settings: Settings, total: TotalStats): void {
  const data: StoredData = {
    version: 1,
    settings,
    total,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Aplikacija nastavlja raditi ako
    // spremanje nije dopušteno.
  }
}
