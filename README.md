# RID - Reactive Interactive DOM

A lightweight (~2KB) and efficient library for building reactive web components.

## 🚀 Features

- **Ultra Lightweight**: Only ~2KB minified and gzipped
- **Zero Dependencies**: Built on web standards
- **Web Components**: Native browser features
- **Reactive State**: Fine-grained reactivity
- **Keyed Iterations**: Efficient list updates
- **SSR Support**: Server-side rendering with hydration
- **Type-Safe**: Built with TypeScript

## 📦 Installation

```bash
npm install ridjs
```

## 🎯 Quick Start

```typescript
import { r as reactive, f as effect, h as html } from "ridjs";

// Create reactive state
const state = reactive({
  count: 0,
  items: [],
});

// Component with effects
const Counter = () => {
  effect(() => {
    console.log("Count changed:", state.count);
  });

  return html`
    <div>
      <p>Count: ${state.count}</p>
      <button onclick=${() => state.count++}>Increment</button>
    </div>
  `;
};
```

## ⚡ Effect System

RID uses a simple yet powerful effect system:

```typescript
// Reactive state
const state = reactive({
  count: 0,
  items: [],
});

// Effect automatically tracks dependencies
effect(() => {
  console.log("Count changed:", state.count);
  // Optional cleanup
  return () => {
    console.log("Cleanup");
  };
});
```

## 🔄 Atomic State Management

```typescript
// Computed values
const completedCount = computed(() =>
  state.items.filter(item => item.completed).length
);

// Batched actions
const addTodo = action((text: string) => {
  state.items.push({ text, completed: false });
  state.count++;  // Batched with previous update
});

// Efficient selectors
const getActive = select(state, s =>
  s.items.filter(item => !item.completed)
);

// Organized stores
const store = createStore({
  items: [],
  filter: 'all'
})
.compute('filtered', state => /*...*/)
.addAction('add', (state, text) => /*...*/);
```

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

## 📦 Optimized Bundle

The library is highly optimized:

- Core bundle ~2KB gzipped
- Tree-shaking friendly
- No runtime overhead
- Efficient memory usage

```typescript
// Import optimized exports
import {
  r as reactive, // Reactive state
  f as effect, // Effects
  h as html, // Templates
} from "ridjs";

// Create components
const App = () => html`
  <div>${state.items.map((item) => html` <div>${item.text}</div> `)}</div>
`;
```

## 🔍 Performance

- No virtual DOM overhead
- Direct DOM updates
- Automatic dependency tracking
- Efficient cleanup
- Minimal memory usage
- Batched updates
- Keyed iterations

## 📁 Project Structure

```
src/
  └── core/
      └── index.ts  # Single optimized bundle
```

## 🛠️ Development

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build

# Test
npm test
```

## 📄 License

MIT
