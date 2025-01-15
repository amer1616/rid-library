// Re-export core functionality with optimized names
export { s as state, f as effect, h as html, define } from "./core";

// Export types
export type {
  PropTypes,
  ComponentOptions,
  PropTypeToTSType,
  TemplateResult,
} from "./core";

// Server-side rendering (tree-shakeable)
export { renderToString, renderToStream } from "./server";
export type { SSRContext } from "./server";
