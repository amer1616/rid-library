# RID - Reactive Interactive DOM

[Previous content until State Management section, then add:]

## 🔄 State Management

### Store API

RID provides a powerful store system for managing application state:

```typescript
import { createStore } from "ridjs";

// Define state type
interface TodoState {
  items: Todo[];
  filter: "all" | "active" | "completed";
  search: string;
}

// Create store
const store = createStore<TodoState>({
  items: [],
  filter: "all",
  search: "",
})
  // Add computed values
  .compute("filteredItems", (state) =>
    state.items.filter(
      (item) =>
        state.filter === "all" ||
        item.completed === (state.filter === "completed")
    )
  )
  // Add actions
  .addAction("addTodo", (state, text: string) => {
    state.items.push({
      id: Date.now(),
      text,
      completed: false,
    });
  });

// Use in components
const TodoList = () => html`
  <ul>
    ${store.get("filteredItems").map((item) => html` <li>${item.text}</li> `)}
  </ul>
`;
```

### Computed Values

```typescript
// Simple computed
store.compute("total", (state) => state.items.length);

// Complex computed with multiple dependencies
store.compute("stats", (state) => ({
  total: state.items.length,
  active: state.items.filter((item) => !item.completed).length,
  completed: state.items.filter((item) => item.completed).length,
}));

// Use computed values
const stats = store.get("stats");
console.log(stats.total, stats.active, stats.completed);
```

### Actions

```typescript
// Simple action
store.addAction("clearCompleted", (state) => {
  state.items = state.items.filter((item) => !item.completed);
});

// Action with parameters
store.addAction("updateItem", (state, id: number, updates: Partial<Todo>) => {
  const item = state.items.find((i) => i.id === id);
  if (item) Object.assign(item, updates);
});

// Dispatch actions
store.dispatch("clearCompleted");
store.dispatch("updateItem", 1, { completed: true });
```

### Type Safety

```typescript
// Define state interface
interface AppState {
  user: User | null;
  theme: "light" | "dark";
  notifications: Notification[];
}

// Create typed store
const store = createStore<AppState>({
  user: null,
  theme: "light",
  notifications: [],
});

// Type-safe computed values
store.compute<number>(
  "unreadCount",
  (state) => state.notifications.filter((n) => !n.read).length
);

// Type-safe actions
store.addAction("setTheme", (state, theme: AppState["theme"]) => {
  state.theme = theme;
});
```

### Store with Components

```typescript
// Create store
const authStore = createStore({
  user: null,
  loading: false,
  error: null,
});

// Header component using store
const Header = () => html`
  <header>
    ${authStore.state.user
      ? html`
          <span>Welcome, ${authStore.state.user.name}</span>
          <button onclick=${() => authStore.dispatch("logout")}>Logout</button>
        `
      : html`
          <button onclick=${() => authStore.dispatch("showLogin")}>
            Login
          </button>
        `}
  </header>
`;

// Form component with store actions
const LoginForm = () => {
  const state = reactive({
    username: "",
    password: "",
  });

  return html`
    <form
      onsubmit=${async (e) => {
        e.preventDefault();
        authStore.dispatch("login", state.username, state.password);
      }}
    >
      <input
        type="text"
        value=${state.username}
        oninput=${(e) => (state.username = e.target.value)}
      />
      <input
        type="password"
        value=${state.password}
        oninput=${(e) => (state.password = e.target.value)}
      />
      <button ?disabled=${authStore.state.loading}>
        ${authStore.state.loading ? "Loading..." : "Login"}
      </button>
      ${authStore.state.error &&
      html` <div class="error">${authStore.state.error}</div> `}
    </form>
  `;
};
```

### Best Practices

1. **State Organization**

```typescript
// Group related state
const store = createStore({
  auth: {
    user: null,
    token: null,
  },
  ui: {
    theme: "light",
    sidebar: false,
  },
  data: {
    items: [],
    loading: false,
  },
});
```

2. **Computed Dependencies**

```typescript
store
  .compute("filteredItems", (state) => state.data.items.filter(filterFn))
  .compute("stats", (state) => ({
    total: state.data.items.length,
    filtered: store.get("filteredItems").length,
  }));
```

3. **Action Composition**

```typescript
store
  .addAction("logout", (state) => {
    state.auth.user = null;
    state.auth.token = null;
  })
  .addAction("resetState", (state) => {
    state.data.items = [];
    store.dispatch("logout");
  });
```

[Rest of the README remains the same...]
