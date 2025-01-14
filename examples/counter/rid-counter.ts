import { html, reactive } from "@rid/rid";

export interface CounterProps {
  count?: number;
  label?: string;
  children?: HTMLElement[];
}

export const Counter = (
  props: Partial<CounterProps>,
) => {
  const state = reactive({
    count: props.count ?? 0,
  });

  // Static data examples
  const buttonText = "Increment";
  const greeting = "Welcome to the counter!";
  const styles = {
    color: "blue",
    padding: "10px"
  };

  return html`
    <div style=${styles.padding}>
      ${greeting}
      ${props.label ? html`<label>${props.label}</label>` : ""}
      <p style="color: ${styles.color}">Count: ${state.count}</p>
      <button onclick=${() => state.count++}>${buttonText}</button>
      ${props.children ? props.children : ""}
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
  children: {
    type: "children" as const,
  },
} as const;
