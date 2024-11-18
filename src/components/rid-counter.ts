// src/components/rid-counter.ts
import { html, reactive } from "@rid/main";

export const Counter = (props: any) => {
  const state = reactive({ count: Number(props.count) || 0 });

  return html`
    <div>
      <p>Count: ${state.count}</p>
      <button onclick=${() => state.count++}>Increment</button>
    </div>
  `;
};
