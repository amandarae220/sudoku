import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Sudoku heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /sudoku puzzle/i });
  expect(heading).toBeInTheDocument();
});
