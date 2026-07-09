# Sudoku

A browser-based Sudoku puzzle game — generate a board, fill it in, and use up to three hints when you get stuck.

Live: https://amandarae220.github.io/sudoku

---

## Overview

A small React app I built to practice game-state logic in TypeScript. It generates a puzzle, validates input to digits 1–9, locks the pre-filled cells, and offers three hints that reveal a correct value in a random empty cell. "Restart Game" deals a fresh board and resets the hint count.

---

## Tech Stack

| Technology | Why I chose it |
|------------|---------------|
| React 19 | Component state (`useState`) maps cleanly to the board/hint model |
| Vite 7 | Fast dev server and build; replaced Create React App after it was deprecated |
| TypeScript 5 | Typed board (`number[][]`) catches indexing mistakes in the grid logic |
| Vitest + Testing Library | Vite-native test runner, no separate Jest/Babel toolchain |

---

## Getting Started

**Prerequisites:** Node 20.19+ and npm.

```bash
# Clone the repo
git clone https://github.com/amandarae220/sudoku.git
cd sudoku

# Install dependencies
npm install

# Start local dev server
npm run dev
```

The app runs at `http://localhost:5173/sudoku/` (the base path matches the GitHub Pages URL).

Other scripts: `npm test` (Vitest), `npm run build` (type-check + production build to `dist/`), `npm run preview` (serve the built output).

---

## Deployment

Hosted on GitHub Pages. Deploys are manual: run `npm run deploy`, which builds to `dist/` and publishes it to the `gh-pages` branch via the `gh-pages` package.

---

## Latest Updates

- **2026-07** — Migrated off Create React App to Vite + Vitest; dropped ~1300 transitive dependencies and cleared all npm audit advisories.
- **2026-07** — Restyled the Hint and Restart buttons.
