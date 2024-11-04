import { define, html } from "../../index.js";

define({
  tagName: "my-counter",
  props: { count: 0 },
  template: (props, state) => html` <div>
    <p>Count: ${state.count}</p>
    <button onclick=${() => state.count++}>+</button>
  </div>`,
  styles: `
    div { padding: 10px; border: 1px solid #ccc; }
    button { cursor: pointer; padding: 5px; }
  `,
});
