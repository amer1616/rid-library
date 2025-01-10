import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/server/index.ts"),
      name: "RIDServer",
      fileName: (format) => `server.${format === "es" ? "js" : "cjs"}`,
      formats: ["es", "cjs"],
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 3,
        pure_funcs: ["console.log", "console.info"],
        drop_debugger: true,
      },
    },
    rollupOptions: {
      external: ["node:stream", "node:util"],
      output: {
        exports: "named",
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/server/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.test.ts"],
      outDir: "dist",
      entryRoot: "src/server",
    }),
  ],
});
