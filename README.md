# RID - Reactive Interactive DOM

RID is a **lightweight** and **modular** JavaScript library for building reactive web components. It provides a unique approach to component development that combines the simplicity of template literals with the power of Web Components.

## 🚀 Features

- **Tiny Footprint**: ~3KB minified and gzipped
- **Zero Dependencies**: Built on web standards
- **Web Components**: Native browser features
- **Reactive State**: Fine-grained reactivity
- **Keyed Iterations**: Efficient list updates
- **SSR Support**: Server-side rendering with hydration
- **Type-Safe**: Built with TypeScript
- **Slots**: Native content distribution

## 📦 Installation

```bash
npm install ridjs
```

## 🎯 Quick Start

```typescript
import { html, reactive, define } from "ridjs";

// Define component props
const counterProps = {
  count: {
    type: "number",
    required: false,
    default: 0,
  },
  label: {
    type: "string",
    required: false,
  },
} as const;

// Create component
const Counter = (props, slots) => {
  const state = reactive({ count: props.count ?? 0 });

  return html`
    <div>
      ${props.label ? html`<label>${props.label}</label>` : ""}
      <p>Count: ${state.count}</p>
      <button onclick=${() => state.count++}>Increment</button>
      ${slots.default ?? ""}
    </div>
  `;
};

// Register component
define("my-counter", Counter, { props: counterProps });
```

Use in HTML:

```html
<my-counter count="5" label="Counter:">
  <span>Default slot content</span>
</my-counter>
```

## 🔑 Props System

Unlike React's props, RID uses a declarative prop system that:

1. Validates props at runtime
2. Converts attributes to proper types
3. Provides default values
4. Handles required props

```typescript
// Prop type definition
const props = {
  text: {
    type: "string",
    required: true,
  },
  count: {
    type: "number",
    default: 0,
  },
  items: {
    type: "array",
    default: [],
  },
} as const;

// Usage in component
const MyComponent = (props, slots) => {
  // props.text is guaranteed to be string
  // props.count is number (default: 0)
  // props.items is array (default: [])
};
```

## 🔄 Keyed Iterations

RID uses keyed iterations for efficient list updates:

```typescript
const List = (props) => {
  return html`
    <ul>
      ${props.items.map((item) =>
        key(
          item.id,
          html`
            <li class="item">
              ${item.content}
              <button onclick=${() => handleClick(item.id)}>Click me</button>
            </li>
          `
        )
      )}
    </ul>
  `;
};
```

Benefits:

- Efficient DOM updates
- State preservation
- Animation support
- Memory efficient

## 🖥️ Server-Side Rendering

```typescript
import { renderToString } from "ridjs/server";

// Render to string
const html = await renderToString(html`<my-counter count="5"></my-counter>`);

// Stream rendering
for await (const chunk of renderToStream(template)) {
  response.write(chunk);
}
```

## 🎨 Styling

Components use Shadow DOM for style encapsulation:

```typescript
const StyledComponent = () => html`
  <style>
    :host {
      display: block;
      margin: 1em;
    }
    .container {
      padding: 1em;
    }
  </style>
  <div class="container">
    <slot></slot>
  </div>
`;
```

## 📁 Project Structure

```
src/
  ├── core/
  │   ├── reactive.ts    # Reactivity system
  │   ├── template.ts    # Template engine
  │   └── component.ts   # Web Component system
  ├── server/
  │   └── index.ts       # SSR implementation
  └── index.ts           # Public API

examples/
  ├── counter/           # Basic counter example
  ├── todo/             # Todo list with keyed items
  ├── form/             # Form handling example
  └── ssr/              # SSR example
```

## 🔮 Future Improvements

1. **Performance**

   - Component memoization
   - Partial hydration
   - Asset optimization

2. **Features**

   - State management
   - Context API
   - Lifecycle hooks
   - Error boundaries

3. **Developer Experience**
   - DevTools
   - Hot reloading
   - Better error messages

## 📄 License

MIT
