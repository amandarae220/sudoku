import React, { useMemo, useState } from "react";
import { generatePuzzle, getConflicts, Board } from "../utils/sudoku"; // Puzzle generator (unique solution guaranteed)
import "./SudokuBoard.css"; // Import updated styles

const SudokuBoard: React.FC = () => {
  const [game, setGame] = useState<{ puzzle: Board; solution: Board }>(() => generatePuzzle());
  const [board, setBoard] = useState<Board>(() => game.puzzle.map((row) => [...row]));
  const [hintedCell, setHintedCell] = useState<[number, number] | null>(null); // Track hinted cell
  const [remainingHints, setRemainingHints] = useState<number>(3); // Track remaining hints
  const [conflicts, setConflicts] = useState<Set<string>>(new Set()); // Cells flagged by the last "Check"

  const { puzzle, solution } = game;

  // The puzzle is solved when every cell is filled and matches the unique solution.
  const isSolved = useMemo(
    () => board.every((row, r) => row.every((value, c) => value !== 0 && value === solution[r][c])),
    [board, solution]
  );

  // Start a fresh puzzle and reset all game state.
  const restartGame = () => {
    const next = generatePuzzle();
    setGame(next);
    setBoard(next.puzzle.map((row) => [...row]));
    setHintedCell(null);
    setRemainingHints(3);
    setConflicts(new Set());
  };

  // Handle user input for Sudoku cells
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const newValue = e.target.value;

    // Allow only numbers 1-9 or an empty value
    if (/^[1-9]?$/.test(newValue)) {
      const newBoard = board.map((row) => [...row]);
      newBoard[rowIndex][colIndex] = newValue === "" ? 0 : parseInt(newValue, 10);
      setBoard(newBoard);
      if (conflicts.size > 0) setConflicts(new Set()); // Clear stale flags once the player edits again
    }
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
              const isHinted = hintedCell && hintedCell[0] === rowIndex && hintedCell[1] === colIndex;
              const isConflict = conflicts.has(key);
              return (
                <input
                  key={key}
                  type="text"
                  inputMode="numeric"
                  aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                  aria-invalid={isConflict}
                  className={`sudoku-cell ${isHinted ? "hinted-cell" : ""} ${isConflict ? "conflict" : ""}`}
                  value={cell === 0 ? "" : cell}
                  onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                  disabled={puzzle[rowIndex][colIndex] !== 0 || isSolved} // Lock givens, and everything once solved
                />
              );
            })
          )}
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
