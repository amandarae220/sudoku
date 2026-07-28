// Persistent game statistics.
//
// Stored under a single versioned key so the shape can evolve safely: loadStats
// tolerates missing/corrupt/older data and always returns a valid object.

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export interface DifficultyStats {
  won: number;
  bestTime: number | null; // seconds
}

export interface GameStats {
  version: number;
  byDifficulty: Record<Difficulty, DifficultyStats>;
  currentStreak: number; // consecutive calendar days with at least one win
  longestStreak: number;
  lastWinDate: string | null; // local YYYY-MM-DD
}

export const STATS_VERSION = 1;
const STATS_KEY = "sudoku-stats";
const LEGACY_BEST_TIME_KEY = "sudoku-best-time";

export const defaultStats = (): GameStats => ({
  version: STATS_VERSION,
  byDifficulty: {
    easy: { won: 0, bestTime: null },
    medium: { won: 0, bestTime: null },
    hard: { won: 0, bestTime: null },
  },
  currentStreak: 0,
  longestStreak: 0,
  lastWinDate: null,
});

// Local calendar date as YYYY-MM-DD (streaks are day-based, in the player's timezone).
export const toISODate = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const previousDay = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
};

// Coerce unknown parsed JSON into a valid GameStats, filling any gaps with defaults.
const normalize = (raw: unknown): GameStats => {
  const base = defaultStats();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<GameStats>;

  const byDifficulty = { ...base.byDifficulty };
  for (const d of DIFFICULTIES) {
    const src = data.byDifficulty?.[d];
    if (src && typeof src === "object") {
      byDifficulty[d] = {
        won: Number.isFinite(src.won) ? Math.max(0, Math.floor(src.won as number)) : 0,
        bestTime:
          typeof src.bestTime === "number" && Number.isFinite(src.bestTime) ? src.bestTime : null,
      };
    }
  }

  return {
    version: STATS_VERSION,
    byDifficulty,
    currentStreak: Number.isFinite(data.currentStreak) ? (data.currentStreak as number) : 0,
    longestStreak: Number.isFinite(data.longestStreak) ? (data.longestStreak as number) : 0,
    lastWinDate: typeof data.lastWinDate === "string" ? data.lastWinDate : null,
  };
};

export const loadStats = (): GameStats => {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) return normalize(JSON.parse(stored));

    // One-time migration from the old standalone best-time key.
    const legacy = localStorage.getItem(LEGACY_BEST_TIME_KEY);
    if (legacy !== null) {
      const seconds = parseInt(legacy, 10);
      if (Number.isFinite(seconds)) {
        const migrated = defaultStats();
        migrated.byDifficulty.medium.bestTime = seconds;
        return migrated;
      }
    }
  } catch {
    /* storage unavailable or malformed — fall through to defaults */
  }
  return defaultStats();
};

export const saveStats = (stats: GameStats): void => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* storage unavailable — keep the in-memory stats only */
  }
};

// Pure reducer: apply a win to the stats and return a new object.
export const applyWin = (
  stats: GameStats,
  difficulty: Difficulty,
  seconds: number,
  date: Date = new Date()
): GameStats => {
  const prev = stats.byDifficulty[difficulty];
  const bestTime = prev.bestTime === null ? seconds : Math.min(prev.bestTime, seconds);

  const today = toISODate(date);
  let currentStreak: number;
  if (stats.lastWinDate === today) {
    currentStreak = stats.currentStreak; // already counted a win today
  } else if (stats.lastWinDate === toISODate(previousDay(date))) {
    currentStreak = stats.currentStreak + 1; // continued from yesterday
  } else {
    currentStreak = 1; // first win, or a gap broke the streak
  }

  return {
    ...stats,
    version: STATS_VERSION,
    byDifficulty: {
      ...stats.byDifficulty,
      [difficulty]: { won: prev.won + 1, bestTime },
    },
    currentStreak,
    longestStreak: Math.max(stats.longestStreak, currentStreak),
    lastWinDate: today,
  };
};

export const totalWon = (stats: GameStats): number =>
  DIFFICULTIES.reduce((sum, d) => sum + stats.byDifficulty[d].won, 0);
