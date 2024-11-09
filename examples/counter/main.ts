import { define, html } from "../../src/main.js";

const counter = {
  tagName: "rid-counter",
  props: { count: 0 },
  template: (props: any, state: any) => html` <div>
    <p>Count: ${state.count}</p>
    <button onclick=${() => state.count++}>+</button>
  </div>`,
  styles: `
    div { padding: 10px; border: 1px solid #ccc; }
    button { cursor: pointer; padding: 5px; }
  `,
};
define(counter);
