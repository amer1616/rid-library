import { reactive, effect } from "./reactive";

/**
 * Create a derived state that updates automatically
 */
export function computed<T>(fn: () => T) {
  let value: T;
  effect(() => {
    value = fn();
  });
  return () => value;
}

/**
 * Create an action to update state with transactions
 */
export function action<T extends (...args: any[]) => void>(fn: T): T {
  return ((...args: any[]) => {
    try {
      startBatch();
      return fn(...args);
    } finally {
      endBatch();
    }
  }) as T;
}

/**
 * Create a selector for efficient state selection
 */
export function select<T, R>(state: T, selector: (state: T) => R) {
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

// Batching system for grouped updates
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

/**
 * Create a store with actions and computed values
 */
export function createStore<T extends object>(initialState: T) {
  const state = reactive(initialState);
  const computedValues = new Map<string, () => any>();
  const actions = new Map<string, Function>();

  return {
    // Get current state
    get state() {
      return state;
    },

    // Add computed value
    compute<R>(name: string, fn: (state: T) => R) {
      computedValues.set(
        name,
        computed(() => fn(state))
      );
      return this;
    },

    // Add action
    addAction<A extends (...args: any[]) => void>(
      name: string,
      fn: (state: T, ...args: Parameters<A>) => void
    ) {
      actions.set(
        name,
        action((...args: Parameters<A>) => fn(state, ...args))
      );
      return this;
    },

    // Get computed value
    get<R>(name: string): R {
      const getter = computedValues.get(name);
      if (!getter) throw new Error(`No computed value named "${name}"`);
      return getter();
    },

    // Dispatch action
    dispatch(name: string, ...args: any[]) {
      const actionFn = actions.get(name);
      if (!actionFn) throw new Error(`No action named "${name}"`);
      actionFn(...args);
    },
  };
}

// Example usage:
/*
const todoStore = createStore({
  items: [],
  filter: 'all'
})
.compute('filtered', state => 
  state.items.filter(item => 
    state.filter === 'all' || item.completed === (state.filter === 'completed')
  )
)
.addAction('add', (state, text: string) => {
  state.items.push({ id: Date.now(), text, completed: false });
})
.addAction('toggle', (state, id: number) => {
  const item = state.items.find(i => i.id === id);
  if (item) item.completed = !item.completed;
});

// Use in component
const TodoList = () => {
  effect(() => {
    console.log('Filtered items:', todoStore.get('filtered'));
  });

  return html`
    <ul>
      ${todoStore.state.items.map(item => html`
        <li onclick=${() => todoStore.dispatch('toggle', item.id)}>
          ${item.text}
        </li>
      `)}
    </ul>
  `;
};
*/
