import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

// The board runs a 1s interval timer; fake timers keep it from ticking outside act().
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

test('renders the Sudoku heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /sudoku/i });
  expect(heading).toBeInTheDocument();
});

test('shows the How to Play steps in the sidebar', () => {
  render(<App />);
  expect(screen.getByText('Select a cell')).toBeInTheDocument();
  expect(screen.getByText('Type a number')).toBeInTheDocument();
  expect(screen.getByText('Erase')).toBeInTheDocument();
});

test('exposes Leaderboard and Player stats panels', () => {
  render(<App />);
  expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  expect(screen.getByText('Player stats')).toBeInTheDocument();
});

test('theme toggle switches to dark', () => {
  render(<App />);
  const dark = screen.getByRole('radio', { name: /dark/i });
  expect(dark).toHaveAttribute('aria-checked', 'false');

  fireEvent.click(dark);

  expect(dark).toHaveAttribute('aria-checked', 'true');
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(localStorage.getItem('sudoku-theme')).toBe('dark');
});

test('changing difficulty persists the choice', () => {
  render(<App />);
  const select = screen.getByLabelText('Difficulty');
  expect(select).toHaveValue('medium');

  fireEvent.change(select, { target: { value: 'hard' } });

  expect(select).toHaveValue('hard');
  expect(localStorage.getItem('sudoku-difficulty')).toBe('hard');
});
