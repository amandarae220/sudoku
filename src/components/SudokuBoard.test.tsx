import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
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
const checkButton = () => screen.getByRole("button", { name: /check puzzle/i });
const statValue = (name: string, value: string) =>
  within(screen.getByRole("group", { name })).getByText(value);

describe("SudokuBoard", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers(); // keep the game timer from ticking outside act() during tests
  });
  afterEach(() => vi.useRealTimers());

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
    act(() => start.focus());
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
    act(() => start.focus());
    fireEvent.keyDown(start, { key: "ArrowUp" }); // already at the top row
    expect(start).toHaveFocus();
  });

  it("flags rule conflicts only after Check is pressed", () => {
    render(<SudokuBoard />);
    // Enter a 3, which duplicates the given 3 already in row 1.
    fireEvent.change(topLeftCell(), { target: { value: "3" } });

    // Nothing is flagged until the player asks.
    expect(topLeftCell()).toHaveAttribute("aria-invalid", "false");

    fireEvent.click(checkButton());

    expect(topLeftCell()).toHaveAttribute("aria-invalid", "true");
  });

  it("highlights the focused cell's row, column, and box as peers", () => {
    render(<SudokuBoard />);
    const focus = screen.getByLabelText("Row 5, column 5");
    fireEvent.focus(focus);

    // Same row, same column, and same 3x3 box all count as peers.
    expect(screen.getByLabelText("Row 5, column 1").className).toContain("peer");
    expect(screen.getByLabelText("Row 1, column 5").className).toContain("peer");
    expect(screen.getByLabelText("Row 4, column 4").className).toContain("peer");
    // An unrelated cell is not a peer.
    expect(screen.getByLabelText("Row 1, column 1").className).not.toContain("peer");
  });

  it("highlights cells sharing the focused cell's value", () => {
    render(<SudokuBoard />);
    // Focus a given "5" (row 3, col 7). Another "5" that is NOT a peer (row 5, col 5)
    // should be flagged purely because it shares the value.
    fireEvent.focus(screen.getByLabelText("Row 3, column 7"));
    const other = screen.getByLabelText("Row 5, column 5");
    expect(other.className).toContain("same-number");
    expect(other.className).not.toContain("peer");
  });

  describe("timer and best time", () => {
    it("counts up while playing and freezes on win", () => {
      render(<SudokuBoard />);
      expect(statValue("Time", "0:00")).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(3000));
      expect(statValue("Time", "0:03")).toBeInTheDocument();

      fireEvent.change(topLeftCell(), { target: { value: "5" } }); // solve

      act(() => vi.advanceTimersByTime(5000)); // timer should be frozen now
      expect(statValue("Time", "0:03")).toBeInTheDocument();
    });

    it("records the solve time as the best time and persists it", () => {
      render(<SudokuBoard />);
      act(() => vi.advanceTimersByTime(3000));
      fireEvent.change(topLeftCell(), { target: { value: "5" } }); // solve at 0:03

      expect(statValue("Best Time", "0:03")).toBeInTheDocument();
      expect(localStorage.getItem("sudoku-best-time")).toBe("3");
    });

    it("keeps a faster previous best time", () => {
      localStorage.setItem("sudoku-best-time", "1"); // an existing, faster best
      render(<SudokuBoard />);
      act(() => vi.advanceTimersByTime(9000));
      fireEvent.change(topLeftCell(), { target: { value: "5" } }); // solve at 0:09, slower

      expect(statValue("Best Time", "0:01")).toBeInTheDocument();
      expect(localStorage.getItem("sudoku-best-time")).toBe("1");
    });
  });
});
