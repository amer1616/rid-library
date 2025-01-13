import { html, reactive } from "@rid/rid";

export interface CounterProps {
  count?: number;
  label?: string;
}

export const Counter = (
  props: Partial<CounterProps>,
  slots: Record<string, HTMLElement[]>
) => {
  const state = reactive({
    count: props.count ?? counterProps.count.default,
  });

  return html`
    <div>
      ${props.label ? html`<label>${props.label}</label>` : ""}
      <p>Count: ${state.count}</p>
      <button onclick=${() => state.count++}>Increment</button>
      ${slots.default ? slots.default : ""}
    </div>
  `;
};

// Define prop types for the Counter component
export const counterProps = {
  count: {
    type: "number" as const,
    required: false,
    default: 0,
  },
  label: {
    type: "string" as const,
    required: false,
  },
} as const;
