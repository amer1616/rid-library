// Re-export core functionality with optimized names
export { atom as a, effect as f, computed as c, batch as b } from "./store.js";
export { html as h } from "./template.js";
export { createComponent as define } from "./component.js";


// Export store functionality (tree-shakeable)


// Export HMR utilities (development only)
export {
  registerComponent,
  registerInstance,
  unregisterInstance,
  updateComponent,
  devErrors,
  devWarnings,
} from "./hmr.js";
