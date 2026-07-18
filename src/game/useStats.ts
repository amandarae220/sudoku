import { useCallback, useState } from "react";
import { applyWin, Difficulty, GameStats, loadStats, saveStats } from "./stats";

export function useStats() {
  const [stats, setStats] = useState<GameStats>(() => loadStats());

  const recordWin = useCallback((difficulty: Difficulty, seconds: number) => {
    setStats((prev) => {
      const next = applyWin(prev, difficulty, seconds);
      saveStats(next);
      return next;
    });
  }, []);

  return { stats, recordWin };
}
