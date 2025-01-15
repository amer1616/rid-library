import { html, state, key } from "@rid/rid";

// Counter Button Component
interface CounterButtonProps {
  onClick?: () => void;
  label?: string;
  color?: string;
  children?: HTMLElement[];
}

export const CounterButton = (props: Partial<CounterButtonProps>) => {
  const styles = {
    button: `
      padding: 8px 16px;
      background: ${props.color || "#3498db"};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.2s;
    `,
  };

  return html`
    <button style=${styles.button} onclick=${props.onClick}>
      ${props.label || "Click Me"} ${props.children ? props.children : ""}
    </button>
  `;
};

export const counterButtonProps = {
  onClick: {
    type: "function" as const,
    required: false,
  },
  label: {
    type: "string" as const,
    required: false,
  },
  color: {
    type: "string" as const,
    required: false,
  },
  children: {
    type: "children" as const,
  },
} as const;

// Main Counter Component
export interface CounterProps {
  initialCount?: number;
  step?: number;
  label?: string;
  children?: HTMLElement[];
}

export const Counter = (props: Partial<CounterProps>) => {
  // Static styles
  const styles = {
    container:
      "padding: 20px; max-width: 300px; margin: 0 auto; text-align: center;",
    header: "color: #2c3e50; margin-bottom: 20px;",
    count: "font-size: 24px; color: #34495e; margin: 20px 0;",
    buttonsContainer: "display: flex; gap: 10px; justify-content: center;",
  };

  // Reactive state with props
  const state = state({
    count: props.initialCount ?? 0,
  });

  // Event handlers
  const increment = () => {
    state.count += props.step ?? 1;
  };

  const decrement = () => {
    state.count -= props.step ?? 1;
  };

  // Render with child components
  return html`
    <div style=${styles.container}>
      ${props.label ? html`<h2 style=${styles.header}>${props.label}</h2>` : ""}

      <div style=${styles.count}>Count: ${state.count}</div>

      <div style=${styles.buttonsContainer}>
        ${key(
          "dec-btn",
          html`
            <rid-counter-button
              color="#e74c3c"
              label="Decrease"
              onclick=${decrement}
            ></rid-counter-button>
          `
        )}
        ${key(
          "inc-btn",
          html`
            <rid-counter-button
              color="#2ecc71"
              label="Increase"
              onclick=${increment}
            ></rid-counter-button>
          `
        )}
      </div>

      ${props.children ? props.children : ""}
    </div>
  `;
};

// Define prop types for the Counter component
export const counterProps = {
  initialCount: {
    type: "number" as const,
    required: false,
    default: 0,
  },
  step: {
    type: "number" as const,
    required: false,
    default: 1,
  },
  label: {
    type: "string" as const,
    required: false,
  },
  children: {
    type: "children" as const,
  },
} as const;
