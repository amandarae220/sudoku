import { describe, it, expect } from "vitest";
import {
  generateSolvedBoard,
  generatePuzzle,
  countSolutions,
  solveBoard,
  getConflicts,
  Board,
} from "./sudoku";

// A group (row, column, or 3x3 box) is valid when it holds exactly 1–9 once each.
const groupIsComplete = (nums: number[]): boolean =>
  new Set(nums).size === 9 && nums.every((n) => n >= 1 && n <= 9);

const isCompleteAndValid = (board: Board): boolean => {
  for (let i = 0; i < 9; i++) {
    const row = board[i];
    const col = board.map((r) => r[i]);
    if (!groupIsComplete(row) || !groupIsComplete(col)) return false;
  }
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const box: number[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) box.push(board[boxRow + r][boxCol + c]);
      }
      if (!groupIsComplete(box)) return false;
    }
  }
  return true;
};

describe("generateSolvedBoard", () => {
  it("returns a fully valid solved grid", () => {
    expect(isCompleteAndValid(generateSolvedBoard())).toBe(true);
  });

  it("returns a different board across calls (randomized)", () => {
    const a = generateSolvedBoard();
    const b = generateSolvedBoard();
    expect(a).not.toEqual(b);
  });
});

describe("generatePuzzle", () => {
  it("produces a valid solution and a puzzle consistent with it", () => {
    const { puzzle, solution } = generatePuzzle();
    expect(isCompleteAndValid(solution)).toBe(true);
    // Every given (non-empty) puzzle cell must match the solution.
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] !== 0) expect(puzzle[r][c]).toBe(solution[r][c]);
      }
    }
  });

  it("guarantees exactly one solution", () => {
    // Run a few times since generation is randomized.
    for (let i = 0; i < 5; i++) {
      const { puzzle } = generatePuzzle();
      expect(countSolutions(puzzle, 2)).toBe(1);
    }
  });

  it("solving the puzzle reproduces its solution", () => {
    const { puzzle, solution } = generatePuzzle();
    expect(solveBoard(puzzle)).toEqual(solution);
  });

  it("removes cells from the solved board", () => {
    const { puzzle } = generatePuzzle(40);
    const blanks = puzzle.flat().filter((n) => n === 0).length;
    expect(blanks).toBeGreaterThan(0);
  });
});

describe("getConflicts", () => {
  const emptyBoard = (): Board => Array.from({ length: 9 }, () => Array(9).fill(0));

  it("reports no conflicts for a valid solved board", () => {
    expect(getConflicts(generateSolvedBoard()).size).toBe(0);
  });

  it("ignores empty cells", () => {
    expect(getConflicts(emptyBoard()).size).toBe(0);
  });

  it("flags both cells of a row duplicate", () => {
    const board = emptyBoard();
    board[0][0] = 5;
    board[0][8] = 5;
    const conflicts = getConflicts(board);
    expect(conflicts).toEqual(new Set(["0-0", "0-8"]));
  });

  it("flags a column duplicate", () => {
    const board = emptyBoard();
    board[0][3] = 7;
    board[6][3] = 7;
    expect(getConflicts(board)).toEqual(new Set(["0-3", "6-3"]));
  });

  it("flags a 3x3 box duplicate", () => {
    const board = emptyBoard();
    board[0][0] = 2;
    board[2][2] = 2; // same top-left box, different row and column
    expect(getConflicts(board)).toEqual(new Set(["0-0", "2-2"]));
  });

  it("does not flag the same value in different rows, columns, and boxes", () => {
    const board = emptyBoard();
    board[0][0] = 4;
    board[4][4] = 4; // different row, column, and box
    expect(getConflicts(board).size).toBe(0);
  });
});

describe("countSolutions", () => {
  it("counts a solved board as exactly one solution", () => {
    expect(countSolutions(generateSolvedBoard(), 2)).toBe(1);
  });

  it("finds multiple solutions for an empty board (capped by limit)", () => {
    const empty: Board = Array.from({ length: 9 }, () => Array(9).fill(0));
    expect(countSolutions(empty, 2)).toBe(2);
  });
});
