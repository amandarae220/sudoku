// Difficulty selection: the persisted choice plus the generator tuning per level.

import { Difficulty } from "./stats";

export const DIFFICULTY_KEY = "sudoku-difficulty";

// How many cells the generator tries to blank out per difficulty.
export const BLANKS: Record<Difficulty, number> = { easy: 38, medium: 46, hard: 52 };

export const loadDifficulty = (): Difficulty => {
  try {
    const stored = localStorage.getItem(DIFFICULTY_KEY);
    if (stored === "easy" || stored === "medium" || stored === "hard") return stored;
  } catch {
    /* storage unavailable */
  }
  return "medium";
};

export const saveDifficulty = (difficulty: Difficulty): void => {
  try {
    localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch {
    /* storage unavailable — keep the in-memory choice only */
  }
};
