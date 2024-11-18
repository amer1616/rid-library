import { define, html, reactive } from "@rid/main";

const counter = (props: any) => {
  const state = reactive({ count: Number(props.count) || 0 });

  return html`
    <div>
      <p>Count: ${state.count}</p>
      <button onclick=${() => state.count++}>Increment</button>
    </div>
  `;
};

define("rid-counter", counter);
