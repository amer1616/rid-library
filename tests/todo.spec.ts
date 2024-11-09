// tests/todo.spec.ts
import { describe, it, expect } from "vitest";
import { define, html } from "@rid/main";

interface TodoItem {
  text: string;
  completed: boolean;
}

describe("<rid-todo> Component", () => {
  beforeEach(() => {
    // Define the component
    define({
      tagName: "rid-todo",
      props: { todos: [] as TodoItem[] },
      template: (props, state) => html`
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
      `,
      styles: `
        div { padding: 10px; border: 1px solid #ddd; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 5px; }
        button { cursor: pointer; padding: 5px 10px; }
      `,
    });

    // Define helper functions globally for testing
    (window as any).toggleTodo = (index: number) => {
      const todoElement = document.querySelector("rid-todo") as any;
      todoElement.todos[index].completed = !todoElement.todos[index].completed;
    };

    (window as any).addTodo = () => {
      const todoElement = document.querySelector("rid-todo") as any;
      todoElement.todos.push({ text: "New Task", completed: false });
    };
  });

  it("renders with no todos initially", () => {
    document.body.innerHTML = `<rid-todo></rid-todo>`;
    const todo = document.querySelector("rid-todo") as any;
    const listItems = todo.shadowRoot.querySelectorAll("li");
    expect(listItems.length).toBe(0);
  });

  it("adds a new todo when button is clicked", async () => {
    document.body.innerHTML = `<rid-todo></rid-todo>`;
    const todo = document.querySelector("rid-todo") as any;
    const button = todo.shadowRoot.querySelector("button");

    button.click();

    // Wait for reactivity
    await new Promise((resolve) => setTimeout(resolve, 0));

    const listItems = todo.shadowRoot.querySelectorAll("li");
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent).toContain("New Task");
  });

  it("toggles todo completion when checkbox is clicked", async () => {
    document.body.innerHTML = `<rid-todo></rid-todo>`;
    const todo = document.querySelector("rid-todo") as any;
    const button = todo.shadowRoot.querySelector("button");

    // Add a todo first
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const checkbox = todo.shadowRoot.querySelector(
      'input[type="checkbox"]'
    ) as any;
    expect(checkbox.checked).toBe(false);

    // Toggle completion
    checkbox.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(checkbox.checked).toBe(true);
  });
});
