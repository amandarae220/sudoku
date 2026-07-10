import React, { useEffect, useMemo, useRef, useState } from "react";
import { generatePuzzle, getConflicts, Board } from "../utils/sudoku"; // Puzzle generator (unique solution guaranteed)
import "./SudokuBoard.css"; // Import updated styles

const BEST_TIME_KEY = "sudoku-best-time";

// Read the stored best time (in seconds), or null if there isn't one / storage is unavailable.
const loadBestTime = (): number | null => {
  try {
    const stored = localStorage.getItem(BEST_TIME_KEY);
    return stored === null ? null : parseInt(stored, 10);
  } catch {
    return null;
  }
};

// Format a duration in seconds as m:ss.
const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const SudokuBoard: React.FC = () => {
  const [game, setGame] = useState<{ puzzle: Board; solution: Board }>(() => generatePuzzle());
  const [board, setBoard] = useState<Board>(() => game.puzzle.map((row) => [...row]));
  const [hintedCell, setHintedCell] = useState<[number, number] | null>(null); // Track hinted cell
  const [remainingHints, setRemainingHints] = useState<number>(3); // Track remaining hints
  const [conflicts, setConflicts] = useState<Set<string>>(new Set()); // Cells flagged by the last "Check"
  const [seconds, setSeconds] = useState<number>(0); // Elapsed time for the current puzzle
  const [bestTime, setBestTime] = useState<number | null>(() => loadBestTime());

  // References to every cell input, so arrow keys can move focus around the grid.
  const cellRefs = useRef<Array<Array<HTMLInputElement | null>>>(
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );

  const { puzzle, solution } = game;

  const isGiven = (row: number, col: number) => puzzle[row][col] !== 0;

  const focusCell = (row: number, col: number) => {
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      cellRefs.current[row][col]?.focus();
    }
  };

  // Set a single cell's value (0 clears it). Ignores givens.
  const setCell = (row: number, col: number, value: number) => {
    if (isGiven(row, col)) return;
    setBoard((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = value;
      return next;
    });
    if (conflicts.size > 0) setConflicts(new Set()); // Clear stale flags once the player edits again
  };

  // Arrow keys navigate; digits fill; Backspace/Delete clears.
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        focusCell(row - 1, col);
        break;
      case "ArrowDown":
        e.preventDefault();
        focusCell(row + 1, col);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusCell(row, col - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        focusCell(row, col + 1);
        break;
      case "Backspace":
      case "Delete":
      case "0":
        e.preventDefault();
        setCell(row, col, 0);
        break;
      default:
        if (/^[1-9]$/.test(e.key)) {
          e.preventDefault();
          setCell(row, col, parseInt(e.key, 10)); // overwrite in place, no need to clear first
        }
    }
  };

  // The puzzle is solved when every cell is filled and matches the unique solution.
  const isSolved = useMemo(
    () => board.every((row, r) => row.every((value, c) => value !== 0 && value === solution[r][c])),
    [board, solution]
  );

  // Tick the timer once a second while the puzzle is unsolved; freeze on win.
  useEffect(() => {
    if (isSolved) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isSolved]);

  // On win, record a new best time if this solve was faster (or the first).
  useEffect(() => {
    if (!isSolved) return;
    setBestTime((prev) => {
      if (prev !== null && seconds >= prev) return prev;
      try {
        localStorage.setItem(BEST_TIME_KEY, String(seconds));
      } catch {
        /* storage unavailable — keep the in-memory best time only */
      }
      return seconds;
    });
  }, [isSolved, seconds]);

  // Start a fresh puzzle and reset all game state.
  const restartGame = () => {
    const next = generatePuzzle();
    setGame(next);
    setBoard(next.puzzle.map((row) => [...row]));
    setHintedCell(null);
    setRemainingHints(3);
    setConflicts(new Set());
    setSeconds(0);
  };

  // onChange path (mainly on-screen/mobile keyboards). Physical keyboards are
  // handled in handleKeyDown. Take the last digit typed so an existing value can
  // be overwritten without clearing it first.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const raw = e.target.value;
    if (raw === "") {
      setCell(rowIndex, colIndex, 0);
      return;
    }
    const digit = raw.replace(/[^1-9]/g, "").slice(-1);
    if (digit) setCell(rowIndex, colIndex, parseInt(digit, 10));
  };

  // Reveal a hint by filling in a random empty cell
  const revealHint = () => {
    if (remainingHints <= 0) return; // No hints left

    let emptyCells: [number, number][] = [];
    board.forEach((row, rowIndex) =>
      row.forEach((cell, colIndex) => {
        if (cell === 0) emptyCells.push([rowIndex, colIndex]);
      })
    );

    if (emptyCells.length === 0) return; // No empty cells left

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHintedCell([row, col]); // Highlight the hinted cell
    setRemainingHints((prev) => prev - 1); // Decrease the remaining hint count

    // Remove highlight after 3 seconds
    setTimeout(() => setHintedCell(null), 3000);
  };

  // On-demand self-check: briefly flag any rule conflicts, then let them fade.
  const checkBoard = () => {
    const found = getConflicts(board);
    setConflicts(found);
    if (found.size > 0) {
      setTimeout(() => setConflicts(new Set()), 2500);
    }
  };

  return (
    <div className="sudoku-container">
      <div>
        {isSolved && (
          <p className="win-banner" role="status" aria-live="polite">
            ✓ You solved it!
          </p>
        )}

        <div className={`sudoku-grid ${isSolved ? "solved" : ""}`}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              const given = isGiven(rowIndex, colIndex);
              const isHinted = hintedCell && hintedCell[0] === rowIndex && hintedCell[1] === colIndex;
              const isConflict = conflicts.has(key);
              return (
                <input
                  key={key}
                  ref={(el) => {
                    cellRefs.current[rowIndex][colIndex] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                  aria-invalid={isConflict}
                  className={`sudoku-cell ${given ? "given" : ""} ${isHinted ? "hinted-cell" : ""} ${isConflict ? "conflict" : ""}`}
                  value={cell === 0 ? "" : cell}
                  onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                  // Givens (and everything once solved) are read-only, not disabled,
                  // so they stay keyboard-focusable and visible to screen readers.
                  readOnly={given || isSolved}
                />
              );
            })
          )}
        </div>

        <div className="stats" role="status" aria-live="off">
          <span>Time: {formatTime(seconds)}</span>
          <span>Best: {bestTime === null ? "--" : formatTime(bestTime)}</span>
        </div>

        <div className="mb-4">
          {/* Display remaining hints */}
          <p>Remaining Hints: {remainingHints}</p>
        </div>

        <div className="mt-4">
          {isSolved ? (
            <button onClick={restartGame}>New Game</button>
          ) : (
            <>
              <button
                onClick={revealHint}
                className={remainingHints <= 0 ? "hint-disabled" : ""}
                disabled={remainingHints <= 0} // Disable hint button when no hints are left
              >
                Hint
              </button>
              <button onClick={checkBoard}>Check</button>
              <button onClick={restartGame}>Restart Game</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SudokuBoard;
