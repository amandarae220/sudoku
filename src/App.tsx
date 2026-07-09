import React from "react";
import SudokuBoard from "./components/SudokuBoard";

const App: React.FC = () => {
  return (
    <div>
      <h1>Sudoku Puzzle</h1>
      <SudokuBoard />
    </div>
  );
};

export default App;
