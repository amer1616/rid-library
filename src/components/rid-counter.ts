// src/components/rid-counter.ts
import { define, html } from "@rid/main";

define({
  tagName: "rid-counter",
  props: { count: 0 },
  template: (props, state) => html`
    <div>
      <p>Count: ${state.count}</p>
      <button onclick=${() => state.count++}>+</button>
      <slot></slot>
      <!-- Optional: For additional content -->
    </div>
  `,
  styles: `
    div { padding: 10px; border: 1px solid #ccc; }
    button { cursor: pointer; padding: 5px 10px; }
  `,
});
