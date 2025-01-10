import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "examples/store"),
  base: "./",
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      "@rid": resolve(__dirname, "src/core"),
    },
  },
});
