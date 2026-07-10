// Sudoku generation and solving.
//
// A puzzle is a 9x9 grid of numbers where 0 represents an empty cell. The
// generator guarantees every puzzle it returns has *exactly one* solution,
// verified with a backtracking solution counter.

export type Board = number[][];

// Unbiased Fisher–Yates shuffle. Returns a new array; does not mutate the input.
function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Can `num` be placed at (row, col) without breaking Sudoku's row/column/box rules?
function isValidPlacement(board: Board, num: number, row: number, col: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[boxRow + r][boxCol + c] === num) return false;
    }
  }
  return true;
}

// The first empty (0) cell in row-major order, or null if the board is full.
function findEmpty(board: Board): [number, number] | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return [row, col];
    }
  }
  return null;
}

// Solve a puzzle with backtracking. Candidate order is randomized so that
// solving an *empty* board yields a random complete grid. Returns a new solved
// board, or null if the puzzle has no solution.
export function solveBoard(board: Board): Board | null {
  const work = board.map((row) => [...row]);

  const solve = (): boolean => {
    const empty = findEmpty(work);
    if (!empty) return true;
    const [row, col] = empty;
    for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isValidPlacement(work, num, row, col)) {
        work[row][col] = num;
        if (solve()) return true;
        work[row][col] = 0;
      }
    }
    return false;
  };

  return solve() ? work : null;
}

// Count how many solutions a puzzle has, stopping early once `limit` is reached.
// Passing limit = 2 is enough to test uniqueness (1 = unique, 2 = ambiguous).
export function countSolutions(board: Board, limit = 2): number {
  const work = board.map((row) => [...row]);
  let count = 0;

  const solve = (): void => {
    const empty = findEmpty(work);
    if (!empty) {
      count++;
      return;
    }
    const [row, col] = empty;
    for (let num = 1; num <= 9 && count < limit; num++) {
      if (isValidPlacement(work, num, row, col)) {
        work[row][col] = num;
        solve();
        work[row][col] = 0;
      }
    }
  };

  solve();
  return count;
}

// A random, fully solved board.
export function generateSolvedBoard(): Board {
  const empty: Board = Array.from({ length: 9 }, () => Array(9).fill(0));
  // Solving an empty board always succeeds, so the non-null assertion is safe.
  return solveBoard(empty)!;
}

// Generate a puzzle and its unique solution. `difficulty` is the number of cells
// we attempt to blank out; a cell is only removed if the puzzle remains uniquely
// solvable, so the achieved count may be slightly lower for higher difficulties.
export function generatePuzzle(difficulty = 45): { puzzle: Board; solution: Board } {
  const solution = generateSolvedBoard();
  const puzzle = solution.map((row) => [...row]);

  // Visit cells in random order, removing each only if uniqueness is preserved.
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i));

  let removed = 0;
  for (const pos of positions) {
    if (removed >= difficulty) break;
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    const value = puzzle[row][col];

    puzzle[row][col] = 0;
    if (countSolutions(puzzle, 2) === 1) {
      removed++;
    } else {
      puzzle[row][col] = value; // restore — removing this cell made the puzzle ambiguous
    }
  }

  return { puzzle, solution };
}
