import { define } from "../../src/rid";
import { Todo, todoProps, todoSlots } from "../../src/components/rid-todo";

// Register the Todo component with prop types and slots
define("rid-todo", Todo, { props: todoProps, slots: todoSlots });

// Initial todos
const initialTodos = [
  { text: "Learn RID.js", completed: true },
  { text: "Build something awesome", completed: false },
  { text: "Share with the world", completed: false },
];

// Initialize the todo list with props and slots
document.body.innerHTML = `
  <rid-todo title="My Todo List" items='${JSON.stringify(initialTodos)}'>
    <div slot="header">
      <p style="color: #666; font-style: italic;">
        Use this list to track your progress
      </p>
    </div>
    <div slot="footer">
      <p style="color: #666; text-align: center;">
        Click "Add Todo" to create a new task
      </p>
    </div>
  </rid-todo>
`;
