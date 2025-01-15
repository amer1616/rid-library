import { s as state, h as html, define } from "../../src/core";
import { createStore } from "../../src/core/store";
import type { StoreInstance } from "../../src/core/store";

// Define Todo types
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  items: Todo[];
  filter: "all" | "active" | "completed";
  search: string;
}

interface TodoStats {
  total: number;
  active: number;
  completed: number;
}

// Create store with initial state
export const todoStore: StoreInstance<TodoState> = createStore<TodoState>({
  items: [],
  filter: "all",
  search: "",
})
  // Add computed values
  .compute<Todo[]>("filteredItems", (state: TodoState) => {
    const filtered = state.items.filter((item) => {
      if (state.filter === "active") return !item.completed;
      if (state.filter === "completed") return item.completed;
      return true;
    });

    if (!state.search) return filtered;

    return filtered.filter((item) =>
      item.text.toLowerCase().includes(state.search.toLowerCase())
    );
  })
  .compute<TodoStats>("stats", (state: TodoState) => ({
    total: state.items.length,
    active: state.items.filter((item) => !item.completed).length,
    completed: state.items.filter((item) => item.completed).length,
  }))
  // Add actions
  .addAction("addTodo", (state: TodoState, text: string) => {
    if (text.trim()) {
      state.items.push({
        id: Date.now(),
        text: text.trim(),
        completed: false,
      });
    }
  })
  .addAction("toggleTodo", (state: TodoState, id: number) => {
    const todo = state.items.find((item) => item.id === id);
    if (todo) todo.completed = !todo.completed;
  })
  .addAction("deleteTodo", (state: TodoState, id: number) => {
    state.items = state.items.filter((item) => item.id !== id);
  })
  .addAction("clearCompleted", (state: TodoState) => {
    state.items = state.items.filter((item) => !item.completed);
  })
  .addAction("setFilter", (state: TodoState, filter: TodoState["filter"]) => {
    state.filter = filter;
  })
  .addAction("setSearch", (state: TodoState, search: string) => {
    state.search = search;
  });

// Form component
const TodoForm = () => {
  const state = state({
    text: "",
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (state.text.trim()) {
      todoStore.dispatch("addTodo", state.text);
      state.text = "";
    }
  };

  return html`
    <form class="add-todo" onsubmit=${handleSubmit}>
      <input
        type="text"
        placeholder="What needs to be done?"
        .value=${state.text}
        oninput=${(e: Event) => {
          const target = e.target as HTMLInputElement;
          state.text = target.value;
        }}
      />
      <button type="submit">Add</button>
    </form>
  `;
};

// TodoList Component
const TodoList = () => {
  const stats = todoStore.get<TodoStats>("stats");
  const filteredItems = todoStore.get<Todo[]>("filteredItems");

  return html`
    <div class="todo-app">
      <header>
        <h1>Todo App with Store</h1>
        <div class="stats">
          <span>Total: ${stats.total}</span>
          <span>Active: ${stats.active}</span>
          <span>Completed: ${stats.completed}</span>
        </div>
      </header>

      <div class="controls">
        <input
          type="text"
          placeholder="Search todos..."
          .value=${todoStore.state.search}
          oninput=${(e: Event) => {
            const target = e.target as HTMLInputElement;
            todoStore.dispatch("setSearch", target.value);
          }}
        />

        <select
          .value=${todoStore.state.filter}
          onchange=${(e: Event) => {
            const target = e.target as HTMLSelectElement;
            todoStore.dispatch(
              "setFilter",
              target.value as TodoState["filter"]
            );
          }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <button
          type="button"
          onclick=${() => todoStore.dispatch("clearCompleted")}
          ?disabled=${stats.completed === 0}
        >
          Clear Completed
        </button>
      </div>

      <todo-form></todo-form>

      <ul class="todo-list">
        ${filteredItems.map(
          (todo: Todo) => html`
            <li key=${todo.id} class=${todo.completed ? "completed" : ""}>
              <input
                type="checkbox"
                ?checked=${todo.completed}
                onchange=${() => todoStore.dispatch("toggleTodo", todo.id)}
              />
              <span>${todo.text}</span>
              <button
                type="button"
                onclick=${() => todoStore.dispatch("deleteTodo", todo.id)}
              >
                Delete
              </button>
            </li>
          `
        )}
      </ul>

      ${filteredItems.length === 0 &&
      html`
        <div class="empty">
          ${todoStore.state.search
            ? "No todos match your search"
            : "No todos yet"}
        </div>
      `}
    </div>

    <style>
      .todo-app {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      header {
        margin-bottom: 2rem;
      }

      h1 {
        margin: 0 0 1rem;
      }

      .stats {
        display: flex;
        gap: 1rem;
        color: #666;
      }

      .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .add-todo {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      input,
      select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      input {
        flex: 1;
      }

      button {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .todo-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .todo-list li {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #eee;
      }

      .todo-list li:last-child {
        border-bottom: none;
      }

      .todo-list li.completed span {
        text-decoration: line-through;
        color: #888;
      }

      .todo-list li button {
        margin-left: auto;
        background: #dc3545;
      }

      .empty {
        text-align: center;
        color: #666;
        padding: 2rem;
      }
    </style>
  `;
};

// Register components
define("todo-form", TodoForm);
define("store-todo", TodoList);
