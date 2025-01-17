// Re-export core functionality with optimized names
export { atom , effect, computed , batch } from "./store.js";
export { html } from "./template.js";
export { createComponent as define } from "./component.js";





// Export HMR utilities (development only)
export {
  registerComponent,
  registerInstance,
  unregisterInstance,
  updateComponent,
  devErrors,
  devWarnings,
} from "./hmr.js";
