import type { TemplateResult } from "./template";

// Re-export core functionality with optimized names
export { state as s, effect as f, computed as c, batch as b } from "./reactive";
export { html as h, key } from "./template";
export { define } from "./component";
export { createStore } from "./store";

// Export types
export type {
  PropTypes,
  ComponentOptions,
  PropTypeToTSType,
} from "./component";

export type {
  TemplateResult,
  HandlerInfo,
  SupportedEvent,
  EventHandler,
} from "./template";

export type { StoreInstance, ComputedFn, ActionFn } from "./store";

// Export store functionality (tree-shakeable)
export { action, select } from "./store";

// Export HMR utilities (development only)
export {
  registerComponent,
  registerInstance,
  unregisterInstance,
  updateComponent,
  devErrors,
  devWarnings,
} from "./hmr";

// Types for public API
export interface Component<P = any> {
  (props: P, slot: Record<string, HTMLElement[]>): TemplateResult;
}

// Utility types
export type Cleanup = () => void;
export type Effect = () => void | Cleanup;
export type Computed<T> = () => T;
export type Action<T extends (...args: any[]) => void> = T;
export type Selector<T, R> = (state: T) => R;
