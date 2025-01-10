import { r as reactive, h as html, define } from "../../src/core";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const Todo = (
  props: { items?: TodoItem[]; title?: string },
  slot: Record<string, HTMLElement[]>
) => {
  const state = reactive({
    items: props.items || [],
    newItemText: "",
  });

  const addItem = () => {
    if (state.newItemText.trim()) {
      state.items.push({
        id: Date.now(),
        text: state.newItemText.trim(),
        completed: false,
      });
      state.newItemText = "";
    }
  };

  const toggleItem = (id: number) => {
    const item = state.items.find((i) => i.id === id);
    if (item) {
      item.completed = !item.completed;
    }
  };

  const deleteItem = (id: number) => {
    state.items = state.items.filter((i) => i.id !== id);
  };

  return html`
    <div class="todo-app">
      <!-- Header with slot -->
      ${slot.header ?? html` <h2>${props.title || "Todo List"}</h2> `}

      <!-- Add new item -->
      <div class="add-item">
        <input
          type="text"
          value=${state.newItemText}
          oninput=${(e: Event) => {
            const target = e.target as HTMLInputElement;
            state.newItemText = target.value;
          }}
          onkeyup=${(e: KeyboardEvent) => {
            if (e.key === "Enter") addItem();
          }}
          placeholder="Add new item..."
        />
        <button onclick=${addItem}>Add</button>
      </div>

      <!-- Todo list -->
      <ul class="todo-list">
        ${state.items.map(
          (item) => html`
            <li key=${item.id} class=${item.completed ? "completed" : ""}>
              <input
                type="checkbox"
                ?checked=${item.completed}
                onchange=${() => toggleItem(item.id)}
              />
              <span>${item.text}</span>
              <button onclick=${() => deleteItem(item.id)}>Delete</button>
            </li>
          `
        )}
      </ul>

      <!-- Empty state -->
      ${state.items.length === 0 &&
      html` <div class="empty-state">${slot.empty ?? "No items yet"}</div> `}

      <!-- Footer slot -->
      ${slot.footer}
    </div>

    <style>
      .todo-app {
        max-width: 500px;
        margin: 20px auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h2 {
        margin: 0 0 20px;
        color: #333;
      }

      .add-item {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }

      input[type="text"] {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      button {
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      button:hover {
        opacity: 0.9;
      }

      .todo-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .todo-list li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }

      .todo-list li.completed span {
        text-decoration: line-through;
        color: #888;
      }

      .todo-list li button {
        margin-left: auto;
        background: #dc3545;
      }

      .empty-state {
        text-align: center;
        color: #666;
        padding: 20px;
      }

      /* Slot styles */
      ::slotted(h2) {
        color: #007bff;
      }

      ::slotted(.footer) {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        color: #666;
      }
    </style>
  `;
};

// Define props
const todoProps = {
  items: {
    type: "array" as const,
    required: false,
    default: [] as TodoItem[],
  },
  title: {
    type: "string" as const,
    required: false,
  },
} as const;

// Register component
define("rid-todo", Todo, {
  props: todoProps,
  slot: ["header", "empty", "footer"],
});
