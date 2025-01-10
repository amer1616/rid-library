// Re-export core functionality
export { reactive, effect } from "./core/reactive";
export { html } from "./core/template";
export { define } from "./core/component";

// Export types
export type {
  PropType,
  PropTypes,
  ComponentOptions,
  PropTypeToTSType,
} from "./core/component";

export type {
  TemplateResult,
  SupportedEvent,
  EventHandler,
} from "./core/template";
