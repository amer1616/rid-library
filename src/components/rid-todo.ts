// src/components/rid-todo.ts
import { html, reactive } from "@rid/main";

interface TodoItem {
  text: string;
  completed: boolean;
}

export const MyTodo = (props: { todos: TodoItem[] }) => {
  const state = reactive({ todos: props.todos });

  const toggleTodo = (index: number) => {
    state.todos[index].completed = !state.todos[index].completed;
  };
  const addTodo = () => {
    state.todos.push({ text: "New Task", completed: false });
  };

  return html`
    <div>
      <h3>Todo List</h3>
      <ul>
        ${state.todos.map(
          (todo: { completed: any; text: any }, index: any) => html`
            <li>
              <input
                type="checkbox"
                checked="${todo.completed}"
                onchange=${() => toggleTodo(index)}
              />
              ${todo.text}
            </li>
          `
        )}
      </ul>
      <button onclick=${addTodo}>Add Todo</button>
    </div>
  `;
};
