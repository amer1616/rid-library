// src/components/rid-todo.ts
import { define, html } from "@rid/main";

interface TodoItem {
  text: string;
  completed: boolean;
}

define({
  tagName: "rid-todo",
  props: { todos: [] as TodoItem[] },
  template: (props, state) => html`
    <div>
      <h3>Todo List</h3>
      <ul>
        ${state.todos.map(
          (todo: { completed: any; text: any }, index: number) => html`
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
  `,
  styles: `
    div { padding: 10px; border: 1px solid #ddd; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 5px; }
    button { cursor: pointer; padding: 5px 10px; }
  `,
});

function toggleTodo(index: number) {
  const todoElement = document.querySelector("rid-todo") as any;
  todoElement.todos[index].completed = !todoElement.todos[index].completed;
}

function addTodo() {
  const todoElement = document.querySelector("rid-todo") as any;
  todoElement.todos.push({ text: "New Task", completed: false });
}
