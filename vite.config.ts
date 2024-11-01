// vite.config.ts

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/render.ts",
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
        pure_funcs: ["console.log", "console.error"], // Remove console logs
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
