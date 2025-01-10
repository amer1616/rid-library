import type { TemplateResult } from "./template";

// Re-export core functionality with optimized names
export { reactive as r } from "./reactive";
export { html as h, key } from "./template";
export { define } from "./component";
export { effect as f } from "./reactive";
export { createStore } from "./store";

// Export types
export type {
  PropType,
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
export { computed, action, select } from "./store";

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
