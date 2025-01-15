import { s as state, h as html, define } from "../../src/core";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface AppState {
  items: TodoItem[];
  isLoading: boolean;
  error: string | null;
  filter: "all" | "active" | "completed";
  searchText: string;
  editingId: number | null;
  user: { name: string } | null;
}

// Create state outside component for demo purposes
const state = state<AppState>({
  items: [],
  isLoading: true,
  error: null,
  filter: "all",
  searchText: "",
  editingId: null,
  user: null,
});

// Export state for demo
(window as any).todoState = state;

// Example of a complex component with various conditional rendering patterns
const TodoApp = () => {
  // Simulate loading
  setTimeout(() => {
    state.isLoading = false;
    state.items = [
      { id: 1, text: "Learn RID", completed: true },
      { id: 2, text: "Build something cool", completed: false },
    ];
  }, 1000);

  const addItem = (text: string) => {
    state.items.push({
      id: Date.now(),
      text,
      completed: false,
    });
  };

  const toggleItem = (id: number) => {
    const item = state.items.find((i) => i.id === id);
    if (item) item.completed = !item.completed;
  };

  const deleteItem = (id: number) => {
    state.items = state.items.filter((i) => i.id !== id);
  };

  const startEdit = (id: number) => {
    state.editingId = id;
  };

  const finishEdit = (id: number, newText: string) => {
    const item = state.items.find((i) => i.id === id);
    if (item) item.text = newText;
    state.editingId = null;
  };

  // Filter items based on current filter and search
  const getFilteredItems = () => {
    return state.items
      .filter((item) => {
        if (state.filter === "active") return !item.completed;
        if (state.filter === "completed") return item.completed;
        return true;
      })
      .filter((item) =>
        item.text.toLowerCase().includes(state.searchText.toLowerCase())
      );
  };

  // Render item with conditional edit state
  const renderItem = (item: TodoItem) => html`
    <li key=${item.id} class=${item.completed ? "completed" : ""}>
      ${state.editingId === item.id
        ? html`
            <input
              type="text"
              value=${item.text}
              onblur=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                finishEdit(item.id, target.value);
              }}
              onkeyup=${(e: KeyboardEvent) => {
                const target = e.target as HTMLInputElement;
                if (e.key === "Enter") finishEdit(item.id, target.value);
              }}
            />
          `
        : html`
            <div class="item-content">
              <input
                type="checkbox"
                ?checked=${item.completed}
                onchange=${() => toggleItem(item.id)}
              />
              <span class="text">${item.text}</span>
              <div class="actions">
                <button onclick=${() => startEdit(item.id)}>Edit</button>
                <button onclick=${() => deleteItem(item.id)}>Delete</button>
              </div>
            </div>
          `}
    </li>
  `;

  return html`
    <div class="todo-app">
      ${state.isLoading
        ? html`<div class="loading">Loading...</div>`
        : state.error
          ? html`<div class="error">${state.error}</div>`
          : html`
              <div class="container">
                <!-- Header with conditional user greeting -->
                <header>
                  ${state.user
                    ? html`<h1>Welcome, ${state.user.name}!</h1>`
                    : html`<h1>Todo App</h1>`}
                </header>

                <!-- Search and filters -->
                <div class="controls">
                  <input
                    type="text"
                    placeholder="Search..."
                    value=${state.searchText}
                    oninput=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      state.searchText = target.value;
                    }}
                  />
                  <select
                    onchange=${(e: Event) => {
                      const target = e.target as HTMLSelectElement;
                      state.filter = target.value as AppState["filter"];
                    }}
                    value=${state.filter}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <!-- Conditional list rendering -->
                ${getFilteredItems().length === 0
                  ? html`
                      <div class="empty">
                        ${state.searchText
                          ? "No matching items"
                          : "No items yet"}
                      </div>
                    `
                  : html`
                      <ul class="todo-list">
                        ${getFilteredItems().map(renderItem)}
                      </ul>
                    `}

                <!-- Add new item -->
                <form
                  onsubmit=${(e: Event) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem(
                      "newItem"
                    ) as HTMLInputElement;
                    if (input.value.trim()) {
                      addItem(input.value.trim());
                      input.value = "";
                    }
                  }}
                >
                  <input name="newItem" placeholder="Add new item..." />
                  <button type="submit">Add</button>
                </form>
              </div>
            `}
    </div>

    <style>
      .todo-app {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        font-family: system-ui, sans-serif;
      }

      .loading,
      .error,
      .empty {
        text-align: center;
        padding: 20px;
        color: #666;
      }

      .error {
        color: #ff4444;
      }

      .controls {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }

      .todo-list {
        list-style: none;
        padding: 0;
      }

      .todo-list li {
        display: flex;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }

      .completed .text {
        text-decoration: line-through;
        color: #888;
      }

      .item-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }

      .actions {
        margin-left: auto;
      }

      button {
        padding: 5px 10px;
        margin-left: 5px;
      }

      input[type="text"] {
        padding: 5px;
        flex: 1;
      }
    </style>
  `;
};

// Register component
define("todo-app", TodoApp);
