import React from "react";
import SudokuBoard from "./components/SudokuBoard";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./theme/useTheme";
import "./App.css";

const App: React.FC = () => {
  const { preference, setTheme } = useTheme();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
          <div>
            <h1 className="brand__name">Sudoku</h1>
            <p className="brand__tagline">Relax. Think. Solve.</p>
          </div>
        </div>

        <figure className="quote">
          <blockquote>“The goal is to fill the grid, not just the numbers.”</blockquote>
          <figcaption>— Unknown</figcaption>
        </figure>

        <div className="sidebar__footer">
          <ThemeToggle preference={preference} onChange={setTheme} />
        </div>
      </aside>

      <main className="game-area">
        <SudokuBoard />
      </main>
    </div>
  );
};

export default App;
