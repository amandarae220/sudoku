// Function to shuffle an array
const shuffleArray = (array: number[]) => array.sort(() => Math.random() - 0.5);

// Generate a solved Sudoku board using a basic backtracking algorithm
function generateSolvedBoard(): number[][] {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  const isValid = (num: number, row: number, col: number): boolean => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
      const boxRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
      const boxCol = Math.floor(col / 3) * 3 + (i % 3);
      if (board[boxRow][boxCol] === num) return false;
    }
    return true;
  };

  const fillBoard = (row = 0, col = 0): boolean => {
    if (row === 9) return true;
    if (col === 9) return fillBoard(row + 1, 0);
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (let num of numbers) {
      if (isValid(num, row, col)) {
        board[row][col] = num;
        if (fillBoard(row, col + 1)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  };

  fillBoard();
  return board;
}

// Remove numbers to create a playable puzzle
export function generateSudoku(difficulty: number = 40): number[][] {
  const solvedBoard = generateSolvedBoard();
  const puzzle = solvedBoard.map(row => [...row]);

  let removed = 0;
  while (removed < difficulty) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }
  
  return puzzle;
}
