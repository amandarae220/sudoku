import React from "react";
import { ThemePreference } from "../theme/useTheme";
import { SunIcon, MoonIcon } from "./icons";
import "./ThemeToggle.css";

interface ThemeToggleProps {
  preference: ThemePreference;
  onChange: (preference: ThemePreference) => void;
}

const OPTIONS: { value: "light" | "dark"; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
];

// When no explicit choice has been made ("system"), reflect the OS setting so
// exactly one option reads as active. Picking either sets an explicit theme.
const resolvePreference = (preference: ThemePreference): "light" | "dark" => {
  if (preference === "light" || preference === "dark") return preference;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
};

// A segmented control implemented as an accessible radio group.
const ThemeToggle: React.FC<ThemeToggleProps> = ({ preference, onChange }) => {
  const active = resolvePreference(preference);
  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Color theme">
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={active === value}
          className={`theme-toggle__option ${active === value ? "is-active" : ""}`}
          onClick={() => onChange(value)}
        >
          <span className="theme-toggle__icon" aria-hidden="true">
            {icon}
          </span>
          {label}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
