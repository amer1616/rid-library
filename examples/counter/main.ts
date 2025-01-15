import { state, html, define } from "@rid/rid";

interface CounterState {
  count: number;
}

const Counter = () => {
  const state = state<CounterState>({
    count: 0,
  });

  return html`
    <div class="counter">
      <h2>Counter: ${state.count}</h2>
      <button onclick=${() => state.count++}>Increment</button>
      <button onclick=${() => state.count--}>Decrement</button>
    </div>

    <style>
      .counter {
        padding: 20px;
        text-align: center;
      }

      button {
        margin: 0 5px;
        padding: 8px 16px;
        font-size: 16px;
      }
    </style>
  `;
};

// Register component
define("rid-counter", Counter);
