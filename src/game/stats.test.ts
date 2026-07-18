import { describe, it, expect, beforeEach } from "vitest";
import {
  defaultStats,
  loadStats,
  saveStats,
  applyWin,
  totalWon,
  toISODate,
  GameStats,
} from "./stats";

const at = (iso: string) => new Date(`${iso}T12:00:00`);

describe("toISODate", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toISODate(new Date(2026, 6, 4))).toBe("2026-07-04"); // month is 0-indexed
  });
});

describe("applyWin", () => {
  it("increments wins and records the first best time", () => {
    const next = applyWin(defaultStats(), "medium", 120, at("2026-07-04"));
    expect(next.byDifficulty.medium.won).toBe(1);
    expect(next.byDifficulty.medium.bestTime).toBe(120);
  });

  it("keeps the faster best time", () => {
    let s = applyWin(defaultStats(), "easy", 200, at("2026-07-04"));
    s = applyWin(s, "easy", 150, at("2026-07-04"));
    s = applyWin(s, "easy", 175, at("2026-07-04"));
    expect(s.byDifficulty.easy.bestTime).toBe(150);
    expect(s.byDifficulty.easy.won).toBe(3);
  });

  it("does not mutate the input", () => {
    const original = defaultStats();
    applyWin(original, "hard", 90, at("2026-07-04"));
    expect(original.byDifficulty.hard.won).toBe(0);
  });

  describe("day streaks", () => {
    it("starts a streak at 1 on the first win", () => {
      const s = applyWin(defaultStats(), "medium", 100, at("2026-07-04"));
      expect(s.currentStreak).toBe(1);
      expect(s.longestStreak).toBe(1);
    });

    it("does not double-count multiple wins on the same day", () => {
      let s = applyWin(defaultStats(), "medium", 100, at("2026-07-04"));
      s = applyWin(s, "hard", 100, at("2026-07-04"));
      expect(s.currentStreak).toBe(1);
    });

    it("increments across consecutive days", () => {
      let s = applyWin(defaultStats(), "medium", 100, at("2026-07-04"));
      s = applyWin(s, "medium", 100, at("2026-07-05"));
      s = applyWin(s, "medium", 100, at("2026-07-06"));
      expect(s.currentStreak).toBe(3);
      expect(s.longestStreak).toBe(3);
    });

    it("resets after a skipped day but preserves the longest", () => {
      let s = applyWin(defaultStats(), "medium", 100, at("2026-07-04"));
      s = applyWin(s, "medium", 100, at("2026-07-05")); // streak 2
      s = applyWin(s, "medium", 100, at("2026-07-08")); // gap -> reset to 1
      expect(s.currentStreak).toBe(1);
      expect(s.longestStreak).toBe(2);
    });
  });
});

describe("totalWon", () => {
  it("sums wins across all difficulties", () => {
    let s = applyWin(defaultStats(), "easy", 100, at("2026-07-04"));
    s = applyWin(s, "hard", 100, at("2026-07-05"));
    expect(totalWon(s)).toBe(2);
  });
});

describe("persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips through save/load", () => {
    const s = applyWin(defaultStats(), "medium", 90, at("2026-07-04"));
    saveStats(s);
    expect(loadStats()).toEqual(s);
  });

  it("returns defaults when nothing is stored", () => {
    expect(loadStats()).toEqual(defaultStats());
  });

  it("recovers from corrupt JSON", () => {
    localStorage.setItem("sudoku-stats", "{not valid json");
    expect(loadStats()).toEqual(defaultStats());
  });

  it("fills gaps in partial stored data", () => {
    localStorage.setItem("sudoku-stats", JSON.stringify({ currentStreak: 5 }));
    const loaded = loadStats();
    expect(loaded.currentStreak).toBe(5);
    expect(loaded.byDifficulty.easy).toEqual({ won: 0, bestTime: null });
  });

  it("migrates the legacy best-time key into medium", () => {
    localStorage.setItem("sudoku-best-time", "142");
    const loaded = loadStats();
    expect(loaded.byDifficulty.medium.bestTime).toBe(142);
  });
});
