import { r as reactive, h as html, define } from "../../src/core";
import type { PropTypeToTSType } from "../../src/core";

// Shared store for app-wide state
const store = reactive({
  theme: "light" as "light" | "dark",
  user: null as { name: string } | null,
});

// Button Component
const buttonProps = {
  text: {
    type: "string" as const,
    required: true,
  },
  type: {
    type: "string" as const,
    required: false,
    default: "primary",
  },
  onClick: {
    type: "function" as const,
    required: true,
  },
} as const;

type ButtonProps = PropTypeToTSType<typeof buttonProps>;

const Button = (props: ButtonProps) => html`
  <button class="button ${props.type}" onclick=${props.onClick}>
    ${props.text}
  </button>

  <style>
    .button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .button:hover {
      opacity: 0.9;
    }

    .primary {
      background: #007bff;
      color: white;
    }

    .secondary {
      background: #6c757d;
      color: white;
    }

    .danger {
      background: #dc3545;
      color: white;
    }
  </style>
`;

define("app-button", Button, { props: buttonProps });

// Theme Switcher Component
const ThemeSwitcher = () => html`
  <div class="theme-switcher">
    <app-button
      text=${store.theme === "light" ? "🌙" : "☀️"}
      type="secondary"
      .onClick=${() =>
        (store.theme = store.theme === "light" ? "dark" : "light")}
    >
    </app-button>
  </div>

  <style>
    .theme-switcher {
      position: fixed;
      top: 20px;
      right: 20px;
    }
  </style>
`;

define("theme-switcher", ThemeSwitcher);

// User Menu Component
const UserMenu = () => html`
  <div class="user-menu">
    ${store.user
      ? html`
          <span>Welcome, ${store.user.name}</span>
          <app-button
            text="Logout"
            type="secondary"
            .onClick=${() => (store.user = null)}
          >
          </app-button>
        `
      : html`
          <app-button
            text="Login"
            .onClick=${() => (store.user = { name: "Developer" })}
          >
          </app-button>
        `}
  </div>

  <style>
    .user-menu {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    span {
      color: var(--text-color);
    }
  </style>
`;

define("user-menu", UserMenu);

// Card Component
const cardProps = {
  title: {
    type: "string" as const,
    required: true,
  },
  collapsible: {
    type: "boolean" as const,
    required: false,
    default: false,
  },
} as const;

type CardProps = PropTypeToTSType<typeof cardProps>;

const Card = (props: CardProps, slot: Record<string, HTMLElement[]>) => {
  const state = reactive({
    isCollapsed: false,
  });

  return html`
    <div class="card">
      <div class="card-header">
        <h3>${props.title}</h3>
        ${props.collapsible &&
        html`
          <app-button
            text=${state.isCollapsed ? "▼" : "▲"}
            type="secondary"
            .onClick=${() => (state.isCollapsed = !state.isCollapsed)}
          >
          </app-button>
        `}
      </div>

      <div class="card-content ${state.isCollapsed ? "collapsed" : ""}">
        ${slot.default}
      </div>
    </div>

    <style>
      .card {
        background: var(--card-bg);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 1rem;
        overflow: hidden;
      }

      .card-header {
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
      }

      .card-header h3 {
        margin: 0;
        color: var(--text-color);
      }

      .card-content {
        padding: 1rem;
        transition: max-height 0.3s ease;
        max-height: 500px;
        overflow: hidden;
      }

      .card-content.collapsed {
        max-height: 0;
        padding: 0 1rem;
      }
    </style>
  `;
};

define("app-card", Card, { props: cardProps });

// Main App Component
const App = () => html`
  <div class="app ${store.theme}">
    <theme-switcher></theme-switcher>

    <header>
      <h1>Component Composition Demo</h1>
      <user-menu></user-menu>
    </header>

    <main>
      <app-card title="Basic Card">
        <p>This is a basic card without any special features.</p>
      </app-card>

      <app-card title="Collapsible Card" collapsible>
        <p>This card can be collapsed using the button in the header.</p>
        <p>It demonstrates prop passing and state management.</p>
      </app-card>

      <app-card title="Interactive Card">
        <div class="button-group">
          <app-button
            text="Primary"
            .onClick=${() => alert("Primary clicked!")}
          >
          </app-button>

          <app-button
            text="Secondary"
            type="secondary"
            .onClick=${() => alert("Secondary clicked!")}
          >
          </app-button>

          <app-button
            text="Danger"
            type="danger"
            .onClick=${() => alert("Danger clicked!")}
          >
          </app-button>
        </div>
      </app-card>
    </main>
  </div>

  <style>
    .app {
      min-height: 100vh;
      transition: all 0.3s ease;
    }

    .light {
      --bg-color: #f5f5f5;
      --text-color: #333;
      --card-bg: white;
      --border-color: #eee;
    }

    .dark {
      --bg-color: #333;
      --text-color: #fff;
      --card-bg: #444;
      --border-color: #555;
    }

    .app {
      background: var(--bg-color);
      color: var(--text-color);
    }

    header {
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
    }

    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .button-group {
      display: flex;
      gap: 10px;
    }

    p {
      margin: 0 0 1rem;
      line-height: 1.5;
    }
  </style>
`;

define("composition-demo", App);
