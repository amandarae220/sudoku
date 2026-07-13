import React from "react";
import { ThemePreference } from "../theme/useTheme";
import "./ThemeToggle.css";

interface ThemeToggleProps {
  preference: ThemePreference;
  onChange: (preference: ThemePreference) => void;
}

const OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: "Light theme", icon: "☀" },
  { value: "dark", label: "Dark theme", icon: "☾" },
  { value: "system", label: "Match system theme", icon: "🖳" },
];

// A segmented control implemented as an accessible radio group.
const ThemeToggle: React.FC<ThemeToggleProps> = ({ preference, onChange }) => {
  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Color theme">
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          aria-label={label}
          title={label}
          className={`theme-toggle__option ${preference === value ? "is-active" : ""}`}
          onClick={() => onChange(value)}
        >
          <span aria-hidden="true">{icon}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
