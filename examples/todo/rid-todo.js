import { html, state, key } from "@rid/rid";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoProps {
  items?: TodoItem[];
  title?: string;
  children?: HTMLElement[];
}

let nextId = 1;

export const Todo = (props: Partial<TodoProps>, children: HTMLElement[]) => {
  const state = state({
    todos:
      props.items?.map((item) => ({
        ...item,
        id: item.id || String(nextId++),
      })) ?? [],
  });

  const toggleTodo = (id: string) => {
    const todo = state.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  };

  const addTodo = () => {
    state.todos.push({
      id: String(nextId++),
      text: "New Task",
      completed: false,
    });
  };

  const renderTodoItem = (todo: TodoItem) =>
    key(
      todo.id,
      html`
        <li class="todo-item ${todo.completed ? "completed" : ""}">
          <input
            type="checkbox"
            ?checked=${todo.completed}
            onchange=${() => toggleTodo(todo.id)}
          />
          <span>${todo.text}</span>
        </li>
      `
    );

  return html`
    <div class="todo-container">
      ${props.title ? html`<h3>${props.title}</h3>` : ""}
      ${children ? html` <div class="todo-header">${children}</div> ` : ""}

      <ul class="todo-list">
        ${state.todos.map(renderTodoItem)}
      </ul>

      <button onclick=${addTodo} class="add-todo-btn">Add Todo</button>
    </div>

    <style>
      .todo-container {
        max-width: 500px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
      }

      .todo-header {
        margin-bottom: 20px;
      }

      .todo-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .todo-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
        transition: opacity 0.2s ease;
      }

      .todo-item.completed span {
        text-decoration: line-through;
        color: #888;
      }

      .todo-item input[type="checkbox"] {
        margin-right: 10px;
      }

      .add-todo-btn {
        margin-top: 20px;
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .add-todo-btn:hover {
        background: #0056b3;
      }

      /* Animation for new items */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .todo-item[data-rid-key] {
        animation: fadeIn 0.3s ease;
      }
    </style>
  `;
};

// Define prop types for the Todo component
export const todoProps = {
  items: {
    type: "array" as const,
    required: false,
    default: [] as TodoItem[],
  },
  title: {
    type: "string" as const,
    required: false,
  },
  children: {
    type: "children" as const,
    required: false,
  },
} as const;

// Type helper for component props
export type TodoPropTypes = typeof todoProps;
