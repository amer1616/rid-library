import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/core/index.ts"),
      name: "RID",
      fileName: (format) => `rid.${format}.js`,
      formats: ["es", "umd"],
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 3,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        drop_debugger: true,
        drop_console: process.env.NODE_ENV === "production",
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        toplevel: true,
        pure_getters: true,
        reduce_vars: true,
        reduce_funcs: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
        toplevel: true,
      },
      format: {
        comments: false,
        wrap_iife: true,
      },
    },
    target: "esnext",
    rollupOptions: {
      output: {
        exports: "named",
        compact: true,
        inlineDynamicImports: true,
        minifyInternalExports: true,
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/core/**/*.ts"],
      exclude: ["**/*.spec.ts", "**/*.test.ts"],
      compilerOptions: {
        removeComments: true,
      },
    }),
  ],
  esbuild: {
    target: "esnext",
    minify: true,
    keepNames: false,
    treeShaking: true,
  },
});
