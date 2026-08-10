/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Production URL is https://www.amandarae.dev/sudoku/, so the app is built to the /sudoku/ base.
export default defineConfig({
  base: "/sudoku/",
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
