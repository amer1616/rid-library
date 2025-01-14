export { reactive, computed, effect } from "./core/reactive";
export { html, key } from "./core/template";
export { define } from "./core/component";

// Export types
export type {
  PropType,
  PropTypes,
  ComponentOptions,
  PropTypeToTSType,
} from "./core/index";

export type {
  TemplateResult,
  SupportedEvent,
  EventHandler,
} from "./core/template";
