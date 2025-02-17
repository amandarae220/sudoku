import React from "react";
import SudokuBoard from "./components/SudokuBoard";

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Sudoku Game</h1>
      <SudokuBoard />
    </div>
  );
};

export default App;
