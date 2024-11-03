import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
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
