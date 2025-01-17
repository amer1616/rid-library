// Store component definitions for HMR
const componentRegistry = new Map();

// Store component instances for HMR updates
const instanceRegistry = new Map();

/**
 * Register a component for HMR
 */
export function registerComponent(name, component, props, slots) {
  componentRegistry.set(name, { component, props, slots });
}

/**
 * Register a component instance for HMR updates
 */
export function registerInstance(name, instance) {
  const instances = instanceRegistry.get(name) || new Set();
  instances.add(instance);
  instanceRegistry.set(name, instances);
}

/**
 * Unregister a component instance
 */
export function unregisterInstance(name, instance) {
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
export function updateComponent(name, newComponent, props, slots) {
  const oldDefinition = componentRegistry.get(name);
  if (!oldDefinition) return;

  // Update component definition
  componentRegistry.set(name, {
    component: newComponent,
    props: props || oldDefinition.props,
    slots: slots || oldDefinition.slots,
  });

  // Update instances
  const instances = instanceRegistry.get(name);
  if (instances) {
    instances.forEach((instance) => {
      if (instance.requestUpdate) {
        instance.requestUpdate();
      }
    });
  }
}

// Development error messages
export const devErrors = {
  INVALID_PROP_TYPE: (name, prop, expected, got) =>
    `[${name}] Invalid prop type for "${prop}". Expected ${expected}, got ${got}`,

  MISSING_REQUIRED_PROP: (name, prop) =>
    `[${name}] Missing required prop "${prop}"`,

  INVALID_SLOT: (name, slot, available) =>
    `[${name}] Invalid slot "${slot}". Available slots: ${available.join(", ")}`,

  COMPONENT_ERROR: (name, error) =>
    `[${name}] Component error: ${error.message}`,

  TEMPLATE_ERROR: (name, error) =>
    `[${name}] Template error: ${error.message}`,

  SSR_ERROR: (name, error) =>
    `[${name}] SSR error: ${error.message}`,
};

// Development warnings
export const devWarnings = {
  DEPRECATED_USAGE: (feature, alternative) =>
    `[Deprecated] ${feature} is deprecated. Use ${alternative} instead.`,

  PERFORMANCE_ISSUE: (component, issue) =>
    `[Performance] ${component}: ${issue}`,

  ACCESSIBILITY: (component, issue) =>
    `[Accessibility] ${component}: ${issue}`,
};

// Enable HMR in development
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (!newModule) return;

    // Update all registered components
    componentRegistry.forEach((definition, name) => {
      if (name in newModule) {
        updateComponent(name, newModule[name]);
      }
    });
  });
}
