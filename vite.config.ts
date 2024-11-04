import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import { vitest } from "vitest";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  resolve: {
    alias: {
      "@rid": path.resolve(__dirname, "src"), // Alias for the library code
    },
  },

  build: {
    outDir: "dist", // Output directory for production build
    lib: {
      entry: "src/index.ts",
      name: "RID",
      fileName: (format) => `rid.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 3,
        drop_console: true, // Remove all console statements
        pure_funcs: ["console.log", "console.error"], // Ensure specific console functions are removed
        drop_debugger: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    },
  },

  plugins: [
    vitest({
      globals: true,
      environment: "jsdom",
    }),
    // dts({
    //   insertTypesEntry: true,
    //   cleanVueFileName: true,
    // }),
  ],
});
