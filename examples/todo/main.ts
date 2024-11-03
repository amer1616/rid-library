import { html, reactive, render, effect } from "../../src/index.ts";

// interface for Todo items
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

/**
 * Initialize reactive state.
 */
const state = reactive({
  todos: [] as Todo[],
  newTodoTxt: "",
});

/**
 * Computed properties for total and completed todos.
 */
const totalTodos = () => state.todos.length;
const completedTodos = () =>
  state.todos.filter((todo) => todo.completed).length;

/**
 * Log changes to total and completed todos.
 */
effect(() => {
  console.log(`Total Todos: ${totalTodos()}, Completed: ${completedTodos()}`);
});

// function add todo
const addTodo = (text: string) => {
  state.todos = [...state.todos, { id: Date.now(), text, completed: false }];
  state.newTodoTxt = "";
};

const todoTmpl = () => {
  // return h: html & hs: handlers
  const { h, hs } = html` <div class="container">
    <h1>Todo App</h1>
    <input
      type="text"
      placeholder="Add a todo"
      value=${state.newTodoTxt}
      oninput=${(e: any) => (state.newTodoTxt = e.target.value)}
      onkeydown=${(e: KeyboardEvent) => {
        if (e.key === "Enter" && state.newTodoTxt.trim() !== "") {
          addTodo(state.newTodoTxt.trim());
          state.newTodoTxt = "";
        }
      }}
    />
    <ul>
      <li><input type="text" placeholder="Add a todo" /></li>
    </ul>
  </div>`;
  return { h, hs };
};

// select element where app will be rendered
const el = document.getElementById("app");

/**
 * Render the template into the container and obtain the detach function.
 */
const detach = render(el!, todoTmpl);
