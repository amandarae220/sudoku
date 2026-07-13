import React, { useEffect, useMemo, useRef, useState } from "react";
import { generatePuzzle, getConflicts, Board } from "../utils/sudoku"; // Puzzle generator (unique solution guaranteed)
import "./SudokuBoard.css"; // Import updated styles

const BEST_TIME_KEY = "sudoku-best-time";
const DIFFICULTY_KEY = "sudoku-difficulty";

type Difficulty = "easy" | "medium" | "hard";

// How many cells the generator tries to blank out per difficulty.
const BLANKS: Record<Difficulty, number> = { easy: 38, medium: 46, hard: 52 };

const loadDifficulty = (): Difficulty => {
  try {
    const stored = localStorage.getItem(DIFFICULTY_KEY);
    if (stored === "easy" || stored === "medium" || stored === "hard") return stored;
  } catch {
    /* storage unavailable */
  }
  return "medium";
};

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
  const [difficulty, setDifficulty] = useState<Difficulty>(() => loadDifficulty());
  const [game, setGame] = useState<{ puzzle: Board; solution: Board }>(() =>
    generatePuzzle(BLANKS[loadDifficulty()])
  );
  const [board, setBoard] = useState<Board>(() => game.puzzle.map((row) => [...row]));
  const [hintedCell, setHintedCell] = useState<[number, number] | null>(null); // Track hinted cell
  const [remainingHints, setRemainingHints] = useState<number>(3); // Track remaining hints
  const [conflicts, setConflicts] = useState<Set<string>>(new Set()); // Cells flagged by the last "Check"
  const [seconds, setSeconds] = useState<number>(0); // Elapsed time for the current puzzle
  const [bestTime, setBestTime] = useState<number | null>(() => loadBestTime());
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null); // Drives peer / same-number highlighting

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

  // Completion progress: how many of the originally-blank cells are now filled.
  const progress = useMemo(() => {
    let blanks = 0;
    let filled = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] === 0) {
          blanks++;
          if (board[r][c] !== 0) filled++;
        }
      }
    }
    return blanks === 0 ? 100 : Math.round((filled / blanks) * 100);
  }, [board, puzzle]);

  // The value under the focused cell (0 if empty) — drives same-number highlighting.
  const focusedValue = focusedCell ? board[focusedCell[0]][focusedCell[1]] : 0;

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

  // Start a fresh puzzle at the given difficulty and reset all game state.
  const newGame = (level: Difficulty) => {
    const next = generatePuzzle(BLANKS[level]);
    setGame(next);
    setBoard(next.puzzle.map((row) => [...row]));
    setHintedCell(null);
    setRemainingHints(3);
    setConflicts(new Set());
    setSeconds(0);
    setFocusedCell(null);
  };

  const restartGame = () => newGame(difficulty);

  const changeDifficulty = (level: Difficulty) => {
    setDifficulty(level);
    try {
      localStorage.setItem(DIFFICULTY_KEY, level);
    } catch {
      /* storage unavailable — keep the in-memory choice only */
    }
    newGame(level);
  };

  // Does (row, col) share the focused cell's row, column, or 3x3 box?
  const isPeerOfFocus = (row: number, col: number): boolean => {
    if (!focusedCell) return false;
    const [fr, fc] = focusedCell;
    const sameBox = Math.floor(row / 3) === Math.floor(fr / 3) && Math.floor(col / 3) === Math.floor(fc / 3);
    return row === fr || col === fc || sameBox;
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
    <section className="board-card">
      <div className="hud">
        <div className="stat" role="group" aria-label="Time">
          <span className="stat__label">Time</span>
          <span className="stat__value">{formatTime(seconds)}</span>
        </div>
        <div className="stat" role="group" aria-label="Best Time">
          <span className="stat__label">Best Time</span>
          <span className="stat__value">{bestTime === null ? "--" : formatTime(bestTime)}</span>
        </div>
        <div className="stat" role="group" aria-label="Progress">
          <span className="stat__label">Progress</span>
          <div className="stat__progress">
            <span
              className="ring"
              style={{
                background: `conic-gradient(var(--color-accent) ${progress * 3.6}deg, var(--color-surface-sunken) 0deg)`,
              }}
              aria-hidden="true"
            />
            <span className="stat__value">{progress}%</span>
          </div>
        </div>
        <label className="stat difficulty">
          <span className="stat__label">Difficulty</span>
          <select
            className="difficulty__select"
            value={difficulty}
            onChange={(e) => changeDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>

      {isSolved && (
        <p className="win-banner" role="status" aria-live="polite">
          ✓ You solved it!
        </p>
      )}

      <div
        className={`sudoku-grid ${isSolved ? "solved" : ""}`}
        role="grid"
        aria-label="Sudoku board"
      >
        {board.map((row, rowIndex) => (
          <div className="sudoku-row" role="row" key={rowIndex}>
            {row.map((cell, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              const given = isGiven(rowIndex, colIndex);
              const isSelected = focusedCell?.[0] === rowIndex && focusedCell?.[1] === colIndex;
              const isPeer = !isSelected && isPeerOfFocus(rowIndex, colIndex);
              const isSameNumber = !isSelected && focusedValue !== 0 && cell === focusedValue;
              const isHinted = hintedCell && hintedCell[0] === rowIndex && hintedCell[1] === colIndex;
              const isConflict = conflicts.has(key);
              // Roving tabindex: exactly one cell is tabbable (the last-focused one,
              // defaulting to the top-left), so Tab enters the grid once and arrow
              // keys drive navigation from there.
              const rovingRow = focusedCell ? focusedCell[0] : 0;
              const rovingCol = focusedCell ? focusedCell[1] : 0;
              const className = [
                "sudoku-cell",
                given ? "given" : "",
                !given && cell !== 0 ? "entry" : "",
                isSelected ? "selected" : "",
                isPeer ? "peer" : "",
                isSameNumber ? "same-number" : "",
                isHinted ? "hinted-cell" : "",
                isConflict ? "conflict" : "",
                colIndex % 3 === 2 && colIndex !== 8 ? "box-right" : "",
                rowIndex % 3 === 2 && rowIndex !== 8 ? "box-bottom" : "",
                colIndex === 8 ? "last-col" : "",
                rowIndex === 8 ? "last-row" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <div className="sudoku-gridcell" role="gridcell" key={key}>
                  <input
                    ref={(el) => {
                      cellRefs.current[rowIndex][colIndex] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                    aria-invalid={isConflict}
                    className={className}
                    value={cell === 0 ? "" : cell}
                    tabIndex={rowIndex === rovingRow && colIndex === rovingCol ? 0 : -1}
                    onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    onFocus={() => setFocusedCell([rowIndex, colIndex])}
                    // Givens (and everything once solved) are read-only, not disabled,
                    // so they stay keyboard-focusable and visible to screen readers.
                    readOnly={given || isSolved}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="actions">
        {isSolved ? (
          <button className="btn btn--primary" onClick={restartGame}>
            New Game
          </button>
        ) : (
          <>
            <button
              className="btn btn--ghost"
              onClick={revealHint}
              disabled={remainingHints <= 0}
            >
              Hint
              <span className="btn__badge">{remainingHints}</span>
            </button>
            <button className="btn btn--primary" onClick={checkBoard}>
              ✦ Check Puzzle
            </button>
            <button className="btn btn--ghost" onClick={restartGame}>
              ↻ Restart
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default SudokuBoard;
