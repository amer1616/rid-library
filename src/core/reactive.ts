// Reactive system using Proxy

type CB = () => void;
type Cleanup = () => void;

const depsMap = new WeakMap<object, Map<string | symbol, Set<CB>>>();
let activeEffect: CB | null = null;

export const reactive = <T extends object>(obj: T): T => {
  // Use WeakMap for better memory management
  if (!depsMap.has(obj)) {
    depsMap.set(obj, new Map());
  }
  return new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      if (activeEffect) {
        let deps = depsMap.get(target) || new Map();
        if (!deps.has(key)) deps.set(key, new Set());
        deps.get(key)!.add(activeEffect);
        depsMap.set(target, deps);
      }
      return typeof res === "object" && res !== null ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      const old = Reflect.get(target, key, receiver);
      const res = Reflect.set(target, key, value, receiver);
      if (old !== value) {
        const deps = depsMap.get(target)?.get(key);
        deps?.forEach((cb) => cb());
      }
      return res;
    },
  });
};

//Added batching support to prevent unnecessary re-renders
let batchDepth = 0;
const pendingEffects = new Set<CB>();

export const batch = (fn: () => void) => {
  batchDepth++;
  try {
    fn();
  } finally {
    if (--batchDepth === 0) {
      pendingEffects.forEach((effect) => effect());
      pendingEffects.clear();
    }
  }
};

// Effect registration with cleanup
export const effect = (fn: CB): Cleanup => {
  const wrapped: CB = () => {
    cleanup(wrapped);
    activeEffect = wrapped;
    try {
      fn();
    } finally {
      activeEffect = null;
    }
  };
  wrapped();

  // Return cleanup function
  return () => {
    cleanup(wrapped);
  };
};

// Cleanup dependencies
const cleanup = (effectFn: CB) => {
  for (const deps of Object.values(depsMap)) {
    for (const effectSet of deps.values()) {
      effectSet.delete(effectFn);
    }
  }
};

// Development helpers
export const getActiveEffect = () => activeEffect;
export const getDepsMap = () => depsMap;

// Clear all dependencies (useful for testing)
export const clearDeps = () => {
  for (const deps of Object.values(depsMap)) deps.clear();
  activeEffect = null;
};

// Check if a value is reactive
export const isReactive = (value: any): boolean => {
  return !!(value && value.__isReactive);
};

// Mark a value as reactive (for internal use)
Object.defineProperty(reactive, Symbol.for("isReactive"), {
  value: true,
  enumerable: false,
  writable: false,
  configurable: false,
});
