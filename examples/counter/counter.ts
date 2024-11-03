import { define, html } from "../../src/index.ts";

define({
  tagName: "my-counter",
  props: { count: 0 },
  template: (props, state) => html` <div>
    <p>Count: ${state.count}</p>
    <button onclick=${() => state.count++}>+</button>
  </div>`,
});
