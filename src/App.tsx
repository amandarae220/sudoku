import React from "react";
import SudokuBoard from "./components/SudokuBoard";
import ThemeToggle from "./components/ThemeToggle";
import HowToPlay from "./components/HowToPlay";
import StatsPanels from "./components/StatsPanels";
import { BarsIcon } from "./components/icons";
import { useTheme } from "./theme/useTheme";
import { useStats } from "./game/useStats";
import { Difficulty } from "./game/stats";
import { loadDifficulty, saveDifficulty } from "./game/difficulty";
import "./App.css";

const App: React.FC = () => {
  const { preference, setTheme } = useTheme();
  const { stats, recordWin } = useStats();
  const [difficulty, setDifficulty] = React.useState<Difficulty>(() => loadDifficulty());

  const changeDifficulty = (level: Difficulty) => {
    setDifficulty(level);
    saveDifficulty(level);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="backToPortfolio"
          href="/project/sudoku"
          aria-label="Back to portfolio project page"
        >
          ← Back to portfolio
        </a>

        <div className="brand">
          <h1 className="brand__name">Sudoku</h1>
          <p className="brand__tagline">A quiet logic game for calm minds.</p>
        </div>

        <hr className="sidebar__divider" />

        <div className="sidebar__section difficulty-field">
          <span className="sidebar__section-label" id="difficulty-label">
            Difficulty
          </span>
          <div className="difficulty-field__control">
            <BarsIcon className="difficulty-field__icon" />
            <select
              className="difficulty-field__select"
              aria-labelledby="difficulty-label"
              value={difficulty}
              onChange={(e) => changeDifficulty(e.target.value as Difficulty)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="sidebar__panels">
          <HowToPlay />
          <StatsPanels stats={stats} />
        </div>

        <div className="sidebar__footer">
          <ThemeToggle preference={preference} onChange={setTheme} />
        </div>
      </aside>

      <main className="game-area">
        <SudokuBoard key={difficulty} difficulty={difficulty} stats={stats} onRecordWin={recordWin} />
      </main>
    </div>
  );
};

export default App;
