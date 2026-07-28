import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "sudoku-theme";

const readStoredPreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    /* storage unavailable */
  }
  return "system";
};

// Reflect the preference onto <html>. "system" removes the attribute so the
// CSS prefers-color-scheme fallback takes over.
const applyPreference = (preference: ThemePreference) => {
  const root = document.documentElement;
  if (preference === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", preference);
  }
};

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => readStoredPreference());

  useEffect(() => {
    applyPreference(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* storage unavailable — keep the in-memory preference only */
    }
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => setPreference(next), []);

  return { preference, setTheme };
}
