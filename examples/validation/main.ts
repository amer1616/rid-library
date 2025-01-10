import { r as reactive, h as html, define } from "../../src/core";
import type { PropTypeToTSType } from "../../src/core";

// Types
type ButtonType = "primary" | "secondary" | "danger";
type Size = "small" | "medium" | "large";

interface User {
  id: number;
  name: string;
  email: string;
}

// Button Component with validation
const buttonProps = {
  text: {
    type: "string" as const,
    required: true,
  },
  type: {
    type: "string" as const,
    required: false,
    default: "primary" as ButtonType,
    validate: (value: string): value is ButtonType =>
      ["primary", "secondary", "danger"].includes(value),
  },
  size: {
    type: "string" as const,
    required: false,
    default: "medium" as Size,
    validate: (value: string): value is Size =>
      ["small", "medium", "large"].includes(value),
  },
  disabled: {
    type: "boolean" as const,
    required: false,
    default: false,
  },
  onClick: {
    type: "function" as const,
    required: true,
  },
} as const;

type ButtonProps = PropTypeToTSType<typeof buttonProps>;

const Button = (props: ButtonProps) => html`
  <button
    class="button ${props.type} ${props.size}"
    ?disabled=${props.disabled}
    onclick=${props.onClick}
  >
    ${props.text}
  </button>

  <style>
    .button {
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Types */
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

    /* Sizes */
    .small {
      padding: 4px 8px;
      font-size: 12px;
    }

    .medium {
      padding: 8px 16px;
      font-size: 14px;
    }

    .large {
      padding: 12px 24px;
      font-size: 16px;
    }
  </style>
`;

define("val-button", Button, { props: buttonProps });

// User Card Component with validation
const userCardProps = {
  user: {
    type: "object" as const,
    required: true,
    validate: (value: any): value is User =>
      typeof value === "object" &&
      typeof value.id === "number" &&
      typeof value.name === "string" &&
      typeof value.email === "string",
  },
  onEdit: {
    type: "function" as const,
    required: true,
  },
  onDelete: {
    type: "function" as const,
    required: true,
  },
} as const;

type UserCardProps = PropTypeToTSType<typeof userCardProps>;

const UserCard = (props: UserCardProps) => html`
  <div class="user-card">
    <div class="user-info">
      <h3>${props.user.name}</h3>
      <p>${props.user.email}</p>
    </div>
    <div class="actions">
      <val-button
        text="Edit"
        type="secondary"
        size="small"
        .onClick=${() => props.onEdit(props.user)}
      >
      </val-button>
      <val-button
        text="Delete"
        type="danger"
        size="small"
        .onClick=${() => props.onDelete(props.user.id)}
      >
      </val-button>
    </div>
  </div>

  <style>
    .user-card {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .user-info h3 {
      margin: 0 0 0.5rem;
    }

    .user-info p {
      margin: 0;
      color: #666;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }
  </style>
`;

define("user-card", UserCard, { props: userCardProps });

// Main App
const App = () => {
  const state = reactive({
    users: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ] as User[],
    selectedUser: null as User | null,
  });

  const handleEdit = (user: User) => {
    state.selectedUser = user;
    // In real app, show edit modal
    console.log("Edit user:", user);
  };

  const handleDelete = (id: number) => {
    state.users = state.users.filter((u) => u.id !== id);
  };

  return html`
    <div class="app">
      <header>
        <h1>Prop Validation Demo</h1>
        <val-button
          text="Add User"
          type="primary"
          size="large"
          .onClick=${() => console.log("Add user")}
        >
        </val-button>
      </header>

      <div class="user-list">
        ${state.users.map(
          (user) => html`
            <user-card
              .user=${user}
              .onEdit=${handleEdit}
              .onDelete=${handleDelete}
            >
            </user-card>
          `
        )}
      </div>

      <!-- Invalid props example -->
      <div class="examples">
        <h2>Invalid Props Examples:</h2>

        <!-- Invalid button type -->
        <val-button text="Invalid Type" type="invalid" .onClick=${() => {}}>
        </val-button>

        <!-- Invalid user object -->
        <user-card
          .user=${{ id: "invalid", name: 123 }}
          .onEdit=${handleEdit}
          .onDelete=${handleDelete}
        >
        </user-card>
      </div>
    </div>

    <style>
      .app {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      h1 {
        margin: 0;
      }

      .examples {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #ddd;
      }
    </style>
  `;
};

define("validation-demo", App);
