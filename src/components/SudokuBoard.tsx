import React, { useState } from "react";
import { generateSudoku } from "../utils/sudoku"; // Utility to generate a Sudoku board
import "./SudokuBoard.css"; // Import updated styles

const SudokuBoard: React.FC = () => {
  const [initialBoard, setInitialBoard] = useState<number[][]>(generateSudoku());
  const [board, setBoard] = useState<number[][]>(JSON.parse(JSON.stringify(initialBoard)));
  const [solution, setSolution] = useState<number[][]>(generateSudoku(0)); // Store full solution
  const [hintedCell, setHintedCell] = useState<[number, number] | null>(null); // Track hinted cell
  const [remainingHints, setRemainingHints] = useState<number>(3); // Track remaining hints

  // Restart the game with a new board and reset hint count
  const restartGame = () => {
    const newBoard = generateSudoku();
    setInitialBoard(newBoard);
    setBoard(JSON.parse(JSON.stringify(newBoard))); 
    setSolution(generateSudoku(0));
    setHintedCell(null); // Reset hint highlight
    setRemainingHints(3); // Reset hint count
  };

  // Handle user input for Sudoku cells
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const newValue = e.target.value;

    // Allow only numbers 1-9 or an empty value
    if (/^[1-9]?$/.test(newValue)) {
      const newBoard = board.map((row, r) => [...row]);
      newBoard[rowIndex][colIndex] = newValue === "" ? 0 : parseInt(newValue, 10);
      setBoard(newBoard);
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

  return (
    <div className="sudoku-container">
      <div className="flex flex-col items-center">
        <div className="sudoku-grid">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isHinted = hintedCell && hintedCell[0] === rowIndex && hintedCell[1] === colIndex;
              return (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  type="text"
                  className={`sudoku-cell ${isHinted ? "hinted-cell" : ""}`}
                  value={cell === 0 ? "" : cell}
                  onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                  disabled={initialBoard[rowIndex][colIndex] !== 0} // Disable pre-filled cells
                />
              );
            })
          )}
        </div>

        <div className="mb-4">
          {/* Display remaining hints */}
          <p>Remaining Hints: {remainingHints}</p>
        </div>

        <div className="mt-4 space-x-2">
        <button
            onClick={revealHint}
            className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 ${remainingHints <= 0 ? "hint-disabled" : ""}`}
            disabled={remainingHints <= 0} // Disable hint button when no hints are left
          >
            Hint
          </button>
          <button
            onClick={restartGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Restart Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SudokuBoard;
