import React, { useEffect, useRef } from "react";
import { DIFFICULTIES, GameStats, totalWon } from "../game/stats";
import { formatBest } from "../game/format";
import "./StatsDialog.css";

interface StatsDialogProps {
  open: boolean;
  stats: GameStats;
  onClose: () => void;
}

const LABELS: Record<string, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

// Uses the native <dialog> element, which provides focus trapping, Esc-to-close,
// and an inert backdrop for free.
const StatsDialog: React.FC<StatsDialogProps> = ({ open, stats, onClose }) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="stats-dialog" onClose={onClose} aria-labelledby="stats-title">
      <div className="stats-dialog__head">
        <h2 id="stats-title">Your Stats</h2>
        <button type="button" className="stats-dialog__close" aria-label="Close stats" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="stats-dialog__streaks">
        <div className="streak-card">
          <span className="streak-card__value">{stats.currentStreak}</span>
          <span className="streak-card__label">Day Streak</span>
        </div>
        <div className="streak-card">
          <span className="streak-card__value">{stats.longestStreak}</span>
          <span className="streak-card__label">Longest</span>
        </div>
        <div className="streak-card">
          <span className="streak-card__value">{totalWon(stats)}</span>
          <span className="streak-card__label">Solved</span>
        </div>
      </div>

      <table className="stats-table">
        <thead>
          <tr>
            <th scope="col">Difficulty</th>
            <th scope="col">Solved</th>
            <th scope="col">Best Time</th>
          </tr>
        </thead>
        <tbody>
          {DIFFICULTIES.map((d) => (
            <tr key={d}>
              <th scope="row">{LABELS[d]}</th>
              <td>{stats.byDifficulty[d].won}</td>
              <td>{formatBest(stats.byDifficulty[d].bestTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </dialog>
  );
};

export default StatsDialog;
