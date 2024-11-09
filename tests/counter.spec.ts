// tests/counter.spec.ts
import { describe, it, expect } from "vitest";
import { define, html } from "@rid/main";

describe("<rid-counter> Component", () => {
  beforeEach(() => {
    // Define the component
    define({
      tagName: "rid-counter",
      props: { count: 0 },
      template: (props, state) => html`
        <div>
          <p>Count: ${state.count}</p>
          <button onclick=${() => state.count++}>+</button>
        </div>
      `,
      styles: `
        div { padding: 10px; border: 1px solid #ccc; }
        button { cursor: pointer; padding: 5px 10px; }
      `,
    });
  });

  it("renders with initial count", () => {
    document.body.innerHTML = `<rid-counter count="5"></rid-counter>`;
    const counter = document.querySelector("rid-counter") as any;
    const paragraph = counter.shadowRoot.querySelector("p");
    expect(paragraph.textContent).toBe("Count: 5");
  });

  it("increments count on button click", async () => {
    document.body.innerHTML = `<rid-counter count="5"></rid-counter>`;
    const counter = document.querySelector("rid-counter") as any;
    const button = counter.shadowRoot.querySelector("button");

    // Simulate button click
    button.click();

    // Wait for reactivity
    await new Promise((resolve) => setTimeout(resolve, 0));

    const paragraph = counter.shadowRoot.querySelector("p");
    expect(paragraph.textContent).toBe("Count: 6");
  });
});
