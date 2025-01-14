import { describe, it, expect } from "vitest";
import { define } from "@rid/rid";
import { Todo, todoProps, todoSlots } from "../examples/todo/rid-todo";

describe("<rid-todo> Component", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    define("rid-todo", Todo, { props: todoProps, slot: todoSlots });
  });

  it("renders todo list with empty state", () => {
    document.body.innerHTML = `<rid-todo></rid-todo>`;
    const todo = document.querySelector("rid-todo") as any;
    const listItems = todo.shadowRoot.querySelectorAll("li");

    expect(listItems.length).toBe(0);
  });

  it("renders todo list with initial items", () => {
    const items = [
      { text: "Task 1", completed: false },
      { text: "Task 2", completed: true },
    ];

    document.body.innerHTML = `<rid-todo items='${JSON.stringify(
      items
    )}'></rid-todo>`;
    const todo = document.querySelector("rid-todo") as any;
    const listItems = todo.shadowRoot.querySelectorAll("li");

    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent.trim()).toBe("Task 1");
    expect(listItems[1].textContent.trim()).toBe("Task 2");
    expect(listItems[1].classList.contains("completed")).toBe(true);
  });

  it("adds a new todo item on button click", async () => {
    document.body.innerHTML = `<rid-todo></rid-todo>`;
    const todo = document.querySelector("rid-todo") as any;
    const button = todo.shadowRoot.querySelector("button");

    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const listItems = todo.shadowRoot.querySelectorAll("li");
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent.trim()).toBe("New Task");
  });

  it("toggles completion status of a todo item", async () => {
    const items = [{ text: "Task 1", completed: false }];
    document.body.innerHTML = `<rid-todo items='${JSON.stringify(
      items
    )}'></rid-todo>`;
    const todo = document.querySelector("rid-todo") as any;

    const checkbox = todo.shadowRoot.querySelector('input[type="checkbox"]');
    const listItem = todo.shadowRoot.querySelector("li");

    expect(listItem.classList.contains("completed")).toBe(false);

    checkbox.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(listItem.classList.contains("completed")).toBe(true);
  });

  it("renders with custom title", () => {
    document.body.innerHTML = `<rid-todo title="My Tasks"></rid-todo>`;
    const todo = document.querySelector("rid-todo") as any;
    const title = todo.shadowRoot.querySelector("h3");

    expect(title.textContent).toBe("My Tasks");
  });

  it("renders content in header slot", () => {
    document.body.innerHTML = `
      <rid-todo>
        <div slot="header">Custom Header</div>
      </rid-todo>
    `;
    const todo = document.querySelector("rid-todo") as any;
    const headerSlot = todo.shadowRoot.querySelector(".todo-header");

    expect(headerSlot).toBeTruthy();
    expect(headerSlot.textContent.trim()).toBe("Custom Header");
  });

  it("renders content in footer slot", () => {
    document.body.innerHTML = `
      <rid-todo>
        <div slot="footer">Custom Footer</div>
      </rid-todo>
    `;
    const todo = document.querySelector("rid-todo") as any;
    const footerSlot = todo.shadowRoot.querySelector(".todo-footer");

    expect(footerSlot).toBeTruthy();
    expect(footerSlot.textContent.trim()).toBe("Custom Footer");
  });

  it("validates prop types", () => {
    // Invalid items prop type
    document.body.innerHTML = `<rid-todo items="not-an-array"></rid-todo>`;
    const todo1 = document.querySelector("rid-todo") as any;
    expect(todo1.shadowRoot.querySelectorAll("li").length).toBe(0); // Should use default empty array

    // Invalid title prop type
    const consoleError = console.error;
    const errors: string[] = [];
    console.error = (msg: string) => errors.push(msg);

    document.body.innerHTML = `<rid-todo title=${123}></rid-todo>`;
    expect(errors.some((err) => err.includes("must be a string"))).toBe(true);

    console.error = consoleError;
  });

  it("handles dynamic slot content updates", async () => {
    document.body.innerHTML = `
      <rid-todo>
        <div slot="header">Initial Header</div>
      </rid-todo>
    `;
    const todo = document.querySelector("rid-todo") as any;

    // Update slot content
    const header = document.querySelector('[slot="header"]') as HTMLElement;
    header.textContent = "Updated Header";

    // Trigger a re-render
    const button = todo.shadowRoot.querySelector("button");
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const headerSlot = todo.shadowRoot.querySelector(".todo-header");
    expect(headerSlot.textContent.trim()).toBe("Updated Header");
  });
});
