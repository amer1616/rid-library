# RID - Reactive Interactive DOM

[Previous content remains the same until adding new section...]

## 🔄 Atomic State Management

RID provides powerful atomic state management features:

### Computed Values

```typescript
import { computed } from "ridjs";

const state = reactive({
  items: [],
  filter: "all",
});

// Computed value updates automatically
const filteredItems = computed(() =>
  state.items.filter(
    (item) =>
      state.filter === "all" ||
      item.completed === (state.filter === "completed")
  )
);

// Use in component
const TodoList = () => html`
  <ul>
    ${filteredItems().map((item) => html` <li>${item.text}</li> `)}
  </ul>
`;
```

### Actions

```typescript
import { action } from "ridjs";

// Batch multiple state updates
const addTodo = action((text: string) => {
  state.items.push({ id: Date.now(), text, completed: false });
  state.lastUpdated = new Date();
  state.count++;
});

// All updates happen in one batch
addTodo("New task");
```

### Selectors

```typescript
import { select } from "ridjs";

// Efficient state selection
const getCompletedCount = select(
  state,
  (s) => s.items.filter((item) => item.completed).length
);

effect(() => {
  // Only updates when completed count changes
  console.log("Completed:", getCompletedCount());
});
```

### Store Pattern

```typescript
import { createStore } from "ridjs";

// Create a store with actions and computed values
const todoStore = createStore({
  items: [],
  filter: "all",
})
  .compute("filtered", (state) =>
    state.items.filter(
      (item) =>
        state.filter === "all" ||
        item.completed === (state.filter === "completed")
    )
  )
  .addAction("add", (state, text: string) => {
    state.items.push({
      id: Date.now(),
      text,
      completed: false,
    });
  })
  .addAction("toggle", (state, id: number) => {
    const item = state.items.find((i) => i.id === id);
    if (item) item.completed = !item.completed;
  });

// Use in components
const TodoApp = () => html`
  <div>
    <input onchange=${(e) => todoStore.dispatch("add", e.target.value)} />
    <ul>
      ${todoStore
        .get("filtered")
        .map(
          (item) => html`
            <li onclick=${() => todoStore.dispatch("toggle", item.id)}>
              ${item.text}
            </li>
          `
        )}
    </ul>
  </div>
`;
```

### Benefits of Atomic State

1. **Granular Updates**

- Only affected components update
- Automatic dependency tracking
- Efficient batching of changes

2. **Type Safety**

```typescript
interface TodoState {
  items: TodoItem[];
  filter: "all" | "active" | "completed";
}

const store = createStore<TodoState>({
  items: [],
  filter: "all",
});
```

3. **Developer Experience**

- Clear data flow
- Easy debugging
- Predictable updates
- Automatic batching

4. **Performance**

- Minimal re-renders
- Efficient computations
- Memory optimization
- Batched updates

### Best Practices

1. **State Organization**

```typescript
// Group related state
const store = createStore({
  todos: {
    items: [],
    filter: "all",
    search: "",
  },
  ui: {
    theme: "light",
    sidebar: false,
  },
});
```

2. **Computed Dependencies**

```typescript
store.compute("filteredAndSearched", (state) => {
  const filtered = state.todos.items.filter(/* ... */);
  return filtered.filter((item) => item.text.includes(state.todos.search));
});
```

3. **Action Composition**

```typescript
store
  .addAction("addTodo", (state, text) => {
    state.todos.items.push(/* ... */);
  })
  .addAction("clearCompleted", (state) => {
    state.todos.items = state.todos.items.filter((item) => !item.completed);
  });
```

[Rest of README remains the same...]
