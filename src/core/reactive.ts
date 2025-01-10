// Reactive system using Proxy

type CB = () => void;
type Cleanup = () => void;

const depsMap = new Map<object, Map<string | symbol, Set<CB>>>();
let activeEffect: CB | null = null;

export const reactive = <T extends object>(obj: T): T =>
  new Proxy(obj, {
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

// Effect registration with cleanup
export const effect = (fn: CB): Cleanup => {
  const wrapped: CB = () => {
    cleanup(wrapped);
    activeEffect = wrapped;
    fn();
    activeEffect = null;
  };
  wrapped();

  // Return cleanup function
  return () => {
    cleanup(wrapped);
  };
};

// Cleanup dependencies
const cleanup = (effectFn: CB) => {
  depsMap.forEach((deps) => {
    deps.forEach((set) => set.delete(effectFn));
  });
};

// Development helpers
export const getActiveEffect = () => activeEffect;
export const getDepsMap = () => depsMap;

// Clear all dependencies (useful for testing)
export const clearDeps = () => {
  depsMap.clear();
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
