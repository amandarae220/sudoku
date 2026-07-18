import React, { useState } from "react";
import SudokuBoard from "./components/SudokuBoard";
import ThemeToggle from "./components/ThemeToggle";
import StatsDialog from "./components/StatsDialog";
import { useTheme } from "./theme/useTheme";
import { useStats } from "./game/useStats";
import "./App.css";

const App: React.FC = () => {
  const { preference, setTheme } = useTheme();
  const { stats, recordWin } = useStats();
  const [statsOpen, setStatsOpen] = useState(false);

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

        <nav className="sidebar__nav">
          <button type="button" className="nav-item" onClick={() => setStatsOpen(true)}>
            <span className="nav-item__icon" aria-hidden="true">
              📊
            </span>
            Stats
          </button>
        </nav>

        <figure className="quote">
          <blockquote>“The goal is to fill the grid, not just the numbers.”</blockquote>
          <figcaption>— Unknown</figcaption>
        </figure>

        <div className="sidebar__footer">
          <ThemeToggle preference={preference} onChange={setTheme} />
        </div>
      </aside>

      <main className="game-area">
        <SudokuBoard stats={stats} onRecordWin={recordWin} />
      </main>

      <StatsDialog open={statsOpen} stats={stats} onClose={() => setStatsOpen(false)} />
    </div>
  );
};

export default App;
