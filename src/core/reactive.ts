// Reactive system with optimized performance
interface Effect extends Function {
  (): void;
  deps?: Map<object, string | symbol>;
}

// WeakMap for better memory management
const targetMap = new WeakMap<object, Map<string | symbol, Set<Effect>>>();
let activeEffect: Effect | null = null;
let effectStack: Effect[] = [];

// Improved batching with queue
let batchDepth = 0;
const queue = new Set<Effect>();
let isFlushing = false;

const queueEffect = (effect: Effect) => {
  if (batchDepth > 0) {
    queue.add(effect);
  } else {
    effect();
  }
};

const flushQueue = () => {
  if (isFlushing || queue.size === 0) return;
  isFlushing = true;
  
  // Process effects in order they were created to avoid dependency issues
  for (const effect of [...queue]) {
    effect();
  }
  
  queue.clear();
  isFlushing = false;
};

export const batch = (fn: () => void) => {
  batchDepth++;
  try {
    fn();
  } finally {
    if (--batchDepth === 0) {
      flushQueue();
    }
  }
};

export const reactive = <T extends object>(obj: T): T => {
  // Skip if already reactive
  if (isReactive(obj)) return obj as T;

  return new Proxy(obj, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      
      // Only make nested objects reactive when accessed
      return result && typeof result === 'object' ? reactive(result) : result;
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, value, receiver);
      
      // Only trigger if value actually changed
      if (oldValue !== value && result) {
        trigger(target, key);
      }
      
      return result;
    },
    deleteProperty(target, key) {
      const hadKey = key in target;
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey && result) {
        trigger(target, key);
      }
      
      return result;
    }
  });
};

const track = (target: object, key: string | symbol) => {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps = activeEffect.deps || new Map();
    activeEffect.deps.set(target, key);
  }
};

const trigger = (target: object, key: string | symbol) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  if (!effects) return;

  // Create a new set to avoid infinite loops
  const effectsToRun = new Set(effects);
  effectsToRun.forEach(effect => queueEffect(effect));
};

export const effect = (fn: Effect): () => void => {
  const effectFn: Effect = () => {
    cleanup(effectFn);
    
    // Handle nested effects correctly
    effectStack.push(effectFn);
    activeEffect = effectFn;
    
    try {
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };

  effectFn.deps = new Map();
  
  effectFn();
  
  return () => cleanup(effectFn);
};

const cleanup = (effectFn: Effect) => {
  // Get all targets that this effect depends on
  const targets = effectFn.deps?.keys() || [];
  
  // Remove this effect from all its dependencies
  for (const target of targets) {
    const depsMap = targetMap.get(target);
    if (!depsMap) continue;
    
    for (const [key, effects] of depsMap) {
      effects.delete(effectFn);
      
      // Cleanup empty sets
      if (effects.size === 0) {
        depsMap.delete(key);
      }
    }
    
    // Cleanup empty maps
    if (depsMap.size === 0) {
      targetMap.delete(target);
    }
  }
  
  // Clear the effect's dependencies
  effectFn.deps?.clear();
};

export const isReactive = (value: any): boolean => {
  return !!(value && value[Symbol.for('isReactive')]);
};

// Mark reactive values
Object.defineProperty(reactive, Symbol.for('isReactive'), {
  value: true,
  enumerable: false,
  writable: false,
  configurable: false
});
