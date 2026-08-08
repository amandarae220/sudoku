import React from "react";
import Accordion from "./Accordion";
import { TrophyIcon, BarsIcon } from "./icons";
import { DIFFICULTIES, GameStats, totalWon } from "../game/stats";
import { formatBest } from "../game/format";
import "./StatsPanels.css";

const LABELS: Record<string, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

interface StatsPanelsProps {
  stats: GameStats;
}

// Two sidebar accordions built from the persisted stats:
// Leaderboard = best solve time per difficulty; Player Stats = streaks + totals.
const StatsPanels: React.FC<StatsPanelsProps> = ({ stats }) => (
  <>
    <Accordion title="Leaderboard" icon={<TrophyIcon />}>
      <table className="stats-panel__table">
        <thead>
          <tr>
            <th scope="col">Difficulty</th>
            <th scope="col">Best time</th>
          </tr>
        </thead>
        <tbody>
          {DIFFICULTIES.map((d) => (
            <tr key={d}>
              <th scope="row">{LABELS[d]}</th>
              <td>{formatBest(stats.byDifficulty[d].bestTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Accordion>

    <Accordion title="Player stats" icon={<BarsIcon />}>
      <dl className="stats-panel__grid">
        <div className="stats-panel__stat">
          <dt className="stats-panel__label">Day streak</dt>
          <dd className="stats-panel__value">{stats.currentStreak}</dd>
        </div>
        <div className="stats-panel__stat">
          <dt className="stats-panel__label">Longest</dt>
          <dd className="stats-panel__value">{stats.longestStreak}</dd>
        </div>
        <div className="stats-panel__stat">
          <dt className="stats-panel__label">Solved</dt>
          <dd className="stats-panel__value">{totalWon(stats)}</dd>
        </div>
      </dl>
    </Accordion>
  </>
);

export default StatsPanels;
