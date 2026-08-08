import React, { useEffect, useMemo, useRef, useState } from "react";
import { generatePuzzle, getConflicts, Board } from "../utils/sudoku"; // Puzzle generator (unique solution guaranteed)
import { Difficulty, GameStats } from "../game/stats";
import { BLANKS } from "../game/difficulty";
import { formatTime } from "../game/format";
import { ClockIcon, TrophyIcon, BulbIcon } from "./icons";
import "./SudokuBoard.css"; // Import updated styles

interface SudokuBoardProps {
  difficulty: Difficulty; // owned by App; a change remounts this board (keyed) for a fresh puzzle
  stats: GameStats;
  onRecordWin: (difficulty: Difficulty, seconds: number) => void;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({ difficulty, stats, onRecordWin }) => {
  const [game, setGame] = useState<{ puzzle: Board; solution: Board }>(() =>
    generatePuzzle(BLANKS[difficulty])
  );
  const [board, setBoard] = useState<Board>(() => game.puzzle.map((row) => [...row]));
  const [hintedCell, setHintedCell] = useState<[number, number] | null>(null); // Track hinted cell
  const [remainingHints, setRemainingHints] = useState<number>(3); // Track remaining hints
  const [conflicts, setConflicts] = useState<Set<string>>(new Set()); // Cells flagged by the last "Check"
  const [seconds, setSeconds] = useState<number>(0); // Elapsed time for the current puzzle
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null); // Drives peer / same-number highlighting

  // Best time for the active difficulty, straight from the persisted stats.
  const bestTime = stats.byDifficulty[difficulty].bestTime;

  // Guard so a win is recorded exactly once per puzzle (reset on each new game).
  const winRecorded = useRef(false);

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

  // The value under the focused cell (0 if empty) — drives same-number highlighting.
  const focusedValue = focusedCell ? board[focusedCell[0]][focusedCell[1]] : 0;

  // Tick the timer once a second while the puzzle is unsolved; freeze on win.
  useEffect(() => {
    if (isSolved) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isSolved]);

  // On win, record the solve exactly once (updates wins, best time, and streak).
  useEffect(() => {
    if (isSolved && !winRecorded.current) {
      winRecorded.current = true;
      onRecordWin(difficulty, seconds);
    }
  }, [isSolved, seconds, difficulty, onRecordWin]);

  // Start a fresh puzzle at the current difficulty and reset all game state.
  const restartGame = () => {
    const next = generatePuzzle(BLANKS[difficulty]);
    setGame(next);
    setBoard(next.puzzle.map((row) => [...row]));
    setHintedCell(null);
    setRemainingHints(3);
    setConflicts(new Set());
    setSeconds(0);
    setFocusedCell(null);
    winRecorded.current = false;
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
        <div className="hud-stat" role="group" aria-label="Elapsed time">
          <ClockIcon className="hud-stat__icon" />
          <span className="hud-stat__value">{formatTime(seconds)}</span>
          <span className="hud-stat__label">elapsed</span>
        </div>
        <span className="hud__divider" aria-hidden="true" />
        <div className="hud-stat" role="group" aria-label="Best time">
          <TrophyIcon className="hud-stat__icon" />
          <span className="hud-stat__value">{bestTime === null ? "--" : formatTime(bestTime)}</span>
          <span className="hud-stat__label">best time</span>
        </div>
        <span className="hud__divider" aria-hidden="true" />
        <div className="hud-stat" role="group" aria-label="Hints left">
          <BulbIcon className="hud-stat__icon" />
          <span className="hud-stat__value">{remainingHints}</span>
          <span className="hud-stat__label">hints left</span>
        </div>
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
            New game
          </button>
        ) : (
          <>
            <button className="btn btn--ghost" onClick={revealHint} disabled={remainingHints <= 0}>
              Hint
            </button>
            <button className="btn btn--primary" onClick={checkBoard}>
              ✦ Check puzzle
            </button>
            <button type="button" className="btn-link" onClick={restartGame}>
              Start over
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default SudokuBoard;
