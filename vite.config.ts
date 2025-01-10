import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "RID",
      fileName: (format) => `rid.${format}.js`,
      formats: ["es", "umd"],
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 3,
        pure_funcs: ["console.log", "console.info"],
        drop_debugger: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    },
    rollupOptions: {
      output: {
        exports: "named",
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    }),
  ],
  resolve: {
    alias: {
      "@rid": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
