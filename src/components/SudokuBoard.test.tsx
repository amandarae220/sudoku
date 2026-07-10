import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Board } from "../utils/sudoku";
import SudokuBoard from "./SudokuBoard";

// A valid, complete Sudoku solution used as a fixture.
const SOLUTION: Board = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// Puzzle identical to the solution but with the top-left cell blanked out,
// so the game is one correct entry away from solved.
const buildPuzzle = (): Board => {
  const puzzle = SOLUTION.map((row) => [...row]);
  puzzle[0][0] = 0;
  return puzzle;
};

// Mock only the generator; keep the real getConflicts implementation.
vi.mock("../utils/sudoku", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils/sudoku")>();
  return {
    ...actual,
    generatePuzzle: () => ({ puzzle: buildPuzzle(), solution: SOLUTION }),
  };
});

const topLeftCell = () => screen.getByLabelText("Row 1, column 1");

describe("SudokuBoard", () => {
  it("shows the win banner when the final cell is filled correctly", () => {
    render(<SudokuBoard />);
    expect(screen.queryByText(/you solved it/i)).not.toBeInTheDocument();

    fireEvent.change(topLeftCell(), { target: { value: "5" } }); // the correct value

    expect(screen.getByText(/you solved it/i)).toBeInTheDocument();
    expect(screen.getByText("New Game")).toBeInTheDocument();
    expect(topLeftCell()).toHaveAttribute("readonly"); // board locks once solved
  });

  it("does not win when the final cell is filled incorrectly", () => {
    render(<SudokuBoard />);
    fireEvent.change(topLeftCell(), { target: { value: "9" } }); // wrong, but no row/col/box duplicate
    expect(screen.queryByText(/you solved it/i)).not.toBeInTheDocument();
  });

  it("moves focus with arrow keys", () => {
    render(<SudokuBoard />);
    const start = topLeftCell();
    start.focus();
    expect(start).toHaveFocus();

    fireEvent.keyDown(start, { key: "ArrowRight" });
    expect(screen.getByLabelText("Row 1, column 2")).toHaveFocus();

    fireEvent.keyDown(screen.getByLabelText("Row 1, column 2"), { key: "ArrowDown" });
    expect(screen.getByLabelText("Row 2, column 2")).toHaveFocus();
  });

  it("fills a cell by typing a digit and clears it with Backspace", () => {
    render(<SudokuBoard />);
    const cell = topLeftCell(); // the one empty cell in the fixture

    fireEvent.keyDown(cell, { key: "7" });
    expect(cell).toHaveValue("7");

    fireEvent.keyDown(cell, { key: "Backspace" });
    expect(cell).toHaveValue("");
  });

  it("does not let arrow navigation fall off the grid edge", () => {
    render(<SudokuBoard />);
    const start = topLeftCell();
    start.focus();
    fireEvent.keyDown(start, { key: "ArrowUp" }); // already at the top row
    expect(start).toHaveFocus();
  });

  it("flags rule conflicts only after Check is pressed", () => {
    render(<SudokuBoard />);
    // Enter a 3, which duplicates the given 3 already in row 1.
    fireEvent.change(topLeftCell(), { target: { value: "3" } });

    // Nothing is flagged until the player asks.
    expect(topLeftCell()).toHaveAttribute("aria-invalid", "false");

    fireEvent.click(screen.getByText("Check"));

    expect(topLeftCell()).toHaveAttribute("aria-invalid", "true");
  });
});
