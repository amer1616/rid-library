import type { ComponentFunction, PropTypes } from "./component";

// Store component definitions for HMR
const componentRegistry = new Map<
  string,
  {
    component: ComponentFunction;
    props?: PropTypes;
    slots?: readonly string[];
  }
>();

// Store component instances for HMR updates
const instanceRegistry = new Map<
  string,
  Set<HTMLElement & { requestUpdate?: () => void }>
>();

/**
 * Register a component for HMR
 */
export function registerComponent(
  name: string,
  component: ComponentFunction,
  props?: PropTypes,
  slots?: readonly string[]
) {
  componentRegistry.set(name, { component, props, slots });
}

/**
 * Register a component instance for HMR updates
 */
export function registerInstance(
  name: string,
  instance: HTMLElement & { requestUpdate?: () => void }
) {
  const instances = instanceRegistry.get(name) || new Set();
  instances.add(instance);
  instanceRegistry.set(name, instances);
}

/**
 * Unregister a component instance
 */
export function unregisterInstance(
  name: string,
  instance: HTMLElement & { requestUpdate?: () => void }
) {
  const instances = instanceRegistry.get(name);
  if (instances) {
    instances.delete(instance);
    if (instances.size === 0) {
      instanceRegistry.delete(name);
    }
  }
}

/**
 * Update component definition and trigger updates
 */
export function updateComponent(
  name: string,
  newComponent: ComponentFunction,
  props?: PropTypes,
  slots?: readonly string[]
) {
  // Update component definition
  componentRegistry.set(name, { component: newComponent, props, slots });

  // Update all instances
  const instances = instanceRegistry.get(name);
  if (instances) {
    console.log(`[HMR] Updating ${instances.size} instances of ${name}`);
    instances.forEach((instance) => {
      if (instance.requestUpdate) {
        instance.requestUpdate();
      }
    });
  }
}

// Development error messages
export const devErrors = {
  INVALID_PROP_TYPE: (name: string, prop: string, expected: string, got: any) =>
    `[RID] Invalid prop type for "${prop}" in component "${name}". Expected ${expected}, got ${typeof got}`,

  MISSING_REQUIRED_PROP: (name: string, prop: string) =>
    `[RID] Missing required prop "${prop}" in component "${name}"`,

  INVALID_SLOT: (name: string, slot: string, available: string[]) =>
    `[RID] Invalid slot "${slot}" in component "${name}". Available slots: ${available.join(
      ", "
    )}`,

  COMPONENT_ERROR: (name: string, error: Error) =>
    `[RID] Error in component "${name}": ${error.message}\n${error.stack}`,

  TEMPLATE_ERROR: (name: string, error: Error) =>
    `[RID] Template error in component "${name}": ${error.message}`,

  SSR_ERROR: (name: string, error: Error) =>
    `[RID] SSR error in component "${name}": ${error.message}`,
};

// Development warnings
export const devWarnings = {
  DEPRECATED_USAGE: (feature: string, alternative: string) =>
    `[RID] Warning: "${feature}" is deprecated. Use "${alternative}" instead.`,

  PERFORMANCE_ISSUE: (component: string, issue: string) =>
    `[RID] Performance warning in "${component}": ${issue}`,

  ACCESSIBILITY: (component: string, issue: string) =>
    `[RID] Accessibility warning in "${component}": ${issue}`,
};

// Enable HMR in development
if (import.meta.hot) {
  import.meta.hot.accept((newModule: any) => {
    if (newModule) {
      console.log("[HMR] Updating components...");
      // Update components when module changes
      Object.entries(newModule).forEach(([exportName, exported]) => {
        if (
          typeof exported === "function" &&
          componentRegistry.has(exportName)
        ) {
          updateComponent(exportName, exported as ComponentFunction);
        }
      });
    }
  });
}
