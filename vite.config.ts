import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import { vitest } from "vitest";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  resolve: {
    alias: {
      "@rid": path.resolve(__dirname, "src"), // Alias for the library code
      "@rid/*": path.resolve(__dirname, "src/*"),
    },
  },
  // test: {
  //   globals: true,
  //   environment: "jsdom",
  //   alias: {
  //     "@rid": "./src",
  //     "@rid/*": "./src/*", // Explicit alias for Vitest
  //   },
  // },

  build: {
    outDir: "dist", // Output directory for production build
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      // formats: ["es"],
      name: "RID",
      fileName: (format) => `@rid.${format}.js`,
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
    dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
    }),
  ],
});
