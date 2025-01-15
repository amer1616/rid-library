import { state, computed, effect, batch } from "./reactive";

// Store types
export interface StoreInstance<T extends object> {
  state: T;
  compute: <R>(name: string, fn: (state: T) => R) => StoreInstance<T>;
  addAction: <A extends (...args: any[]) => void>(
    name: string,
    fn: (state: T, ...args: Parameters<A>) => void
  ) => StoreInstance<T>;
  get: <R>(name: string) => R;
  dispatch: (name: string, ...args: any[]) => void;
}

// Internal types
type ComputedCache = Map<string, any>;
type ComputedFn<T, R> = (state: T) => R;

type ActionFn<T> = (state: T, ...args: any[]) => void;

// Create a store with state management
export function createStore<T extends object>(
  initialState: T
): StoreInstance<T> {
  const stateFn = state(initialState);
  const computedValues = new Map<string, ComputedFn<T, any>>();
  const computedCache: ComputedCache = new Map();
  const actions = new Map<string, ActionFn<T>>();

  // Clear cache when state changes
  effect(() => {
    JSON.stringify(state); // Track all state changes
    computedCache.clear();
  });

  return {
    get stateFn() {
      return state;
    },

    compute<R>(name: string, fn: ComputedFn<T, R>): StoreInstance<T> {
      const computedFn = computed(() => fn(stateFn));
      computedValues.set(name, computedFn);
      return this;
    },

    addAction<A extends (...args: any[]) => void>(
      name: string,
      fn: (state: T, ...args: Parameters<A>) => void
    ): StoreInstance<T> {
      actions.set(name, fn);
      return this;
    },

    get<R>(name: string): R {
      if (!computedValues.has(name)) {
        throw new Error(`No computed value named "${name}"`);
      }

      if (!computedCache.has(name)) {
        const fn = computedValues.get(name)!;
        computedCache.set(name, fn(this.state));
      }

      return computedCache.get(name);
    },

    dispatch(name: string, ...args: any[]): void {
      const action = actions.get(name);
      if (!action) {
        throw new Error(`No action named "${name}"`);
      }
      batch(() => action(stateFn, ...args));
    },
  };
}

// Create an action that batches updates
export function action<T extends (...args: any[]) => void>(fn: T): T {
  return ((...args: Parameters<T>) => {
    try {
      startBatch();
      return fn(...args);
    } finally {
      endBatch();
    }
  }) as T;
}

// Create a selector for efficient state selection
export function select<T, R>(state: T, selector: (state: T) => R): () => R {
  let currentValue: R;
  let lastState: T | undefined;

  return () => {
    if (lastState !== state) {
      currentValue = selector(state as T);
      lastState = state;
    }
    return currentValue;
  };
}

// Batching system
let batchDepth = 0;
const pendingEffects = new Set<() => void>();

function startBatch() {
  batchDepth++;
}

function endBatch() {
  if (--batchDepth === 0) {
    pendingEffects.forEach((effect) => effect());
    pendingEffects.clear();
  }
}

// Export types
export type { ComputedFn, ActionFn };
