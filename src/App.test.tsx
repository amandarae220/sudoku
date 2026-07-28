import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// The board runs a 1s interval timer; fake timers keep it from ticking outside act().
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('renders the Sudoku heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /sudoku/i });
  expect(heading).toBeInTheDocument();
});
