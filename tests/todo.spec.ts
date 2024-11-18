// tests/todo.spec.ts
import { describe, it, expect } from "vitest";
import { define, html, reactive } from "@rid/main";

interface TodoItem {
  text: string;
  completed: boolean;
}

describe("<rid-todo> Component", () => {
  beforeEach(() => {
    // Define MyTodo component
    define("my-todo", (props) => {
      const state = reactive({
        todos: props.todos || ([] as TodoItem[]),
      });

      const addTodo = () => {
        state.todos.push({ text: "New Task", completed: false });
      };

      return html`
        <div>
          <h3>Todo List</h3>
          <ul>
            ${state.todos.map(
              (
                todo: { completed: any; text: any },
                index: string | number
              ) => html`
                <li>
                  <input
                    type="checkbox"
                    checked="${todo.completed}"
                    onchange=${() => {
                      state.todos[index].completed =
                        !state.todos[index].completed;
                    }}
                  />
                  ${todo.text}
                </li>
              `
            )}
          </ul>
          <button onclick=${addTodo}>Add Todo</button>
        </div>
      `;
    });
  });
  it("renders MyTodo component with empty list", () => {
    document.body.innerHTML = `<my-todo></my-todo>`;
    const todo = document.querySelector("my-todo") as any;
    const listItems = todo.shadowRoot.querySelectorAll("li");

    expect(listItems.length).toBe(0);
  });

  it("adds a new todo item in MyTodo component on button click", async () => {
    document.body.innerHTML = `<my-todo></my-todo>`;
    const todo = document.querySelector("my-todo") as any;
    const button = todo.shadowRoot.querySelector("button");

    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const listItems = todo.shadowRoot.querySelectorAll("li");
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent).toContain("New Task");
  });

  it("toggles completion status of a todo item in MyTodo component", async () => {
    document.body.innerHTML = `<my-todo></my-todo>`;
    const todo = document.querySelector("my-todo") as any;
    const button = todo.shadowRoot.querySelector("button");

    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const checkbox = todo.shadowRoot.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;

    expect(checkbox.checked).toBe(false);

    checkbox.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(checkbox.checked).toBe(true);
  });
});
