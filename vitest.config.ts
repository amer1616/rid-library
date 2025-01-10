// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  resolve: {
    alias: {
      "@rid": path.resolve(__dirname, "./src"),
      "@rid/*": path.resolve(__dirname, "./src/*"),
    },
  },
  test: {
    globals: true,
    setupFiles: "./tests/setup.ts",
    alias: {
      "@rid": path.resolve(__dirname, "./src"),
      "@rid/*": path.resolve(__dirname, "./src/*"),
    },
  },
});
