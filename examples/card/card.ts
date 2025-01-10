import { r as reactive, h as html, define } from "../../src/core";
import type { PropTypeToTSType } from "../../src/core";

type Theme = "light" | "dark";

const cardProps = {
  title: {
    type: "string" as const,
    required: true,
  },
  theme: {
    type: "string" as const,
    required: false,
    default: "light" as Theme,
    // Add validator for theme values
    validate: (value: string): value is Theme =>
      value === "light" || value === "dark",
  },
} as const;

type CardProps = PropTypeToTSType<typeof cardProps>;

const Card = (props: CardProps, slot: Record<string, HTMLElement[]>) => {
  const state = reactive({
    isExpanded: true,
  });

  const theme = props.theme || "light";

  return html`
    <div class="card ${theme}">
      <div class="card-header">
        <h2>${props.title}</h2>
        <button
          class="toggle"
          onclick=${() => (state.isExpanded = !state.isExpanded)}
        >
          ${state.isExpanded ? "▼" : "▲"}
        </button>
      </div>

      <div class="card-content ${state.isExpanded ? "expanded" : ""}">
        ${slot.default}
      </div>

      ${slot.footer && html` <div class="card-footer">${slot.footer}</div> `}
    </div>

    <style>
      .card {
        border-radius: 8px;
        overflow: hidden;
        margin: 1rem;
        transition: all 0.3s ease;
      }

      .light {
        background: white;
        color: #333;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .dark {
        background: #333;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .card-header {
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #eee;
      }

      .dark .card-header {
        border-bottom-color: #444;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
      }

      .toggle {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .toggle:hover {
        background: rgba(0, 0, 0, 0.1);
      }

      .dark .toggle:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .card-content {
        padding: 1rem;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, padding 0.3s ease;
      }

      .card-content.expanded {
        max-height: 500px;
      }

      .card-footer {
        padding: 1rem;
        border-top: 1px solid #eee;
        background: rgba(0, 0, 0, 0.02);
      }

      .dark .card-footer {
        border-top-color: #444;
        background: rgba(255, 255, 255, 0.02);
      }

      /* Slot styles */
      ::slotted(*) {
        margin: 0;
      }

      ::slotted(p) {
        line-height: 1.5;
        margin-bottom: 1rem;
      }

      ::slotted(p:last-child) {
        margin-bottom: 0;
      }
    </style>
  `;
};

// Register component
define("rid-card", Card, {
  props: cardProps,
  slot: ["footer"],
});

// Export for TypeScript support
export type { CardProps, Theme };
