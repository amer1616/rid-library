/// <reference types="jest" />
import { define } from "../src/index";
import { html } from "../src/index";

describe("<rid-counter> Component Tests", () => {
  it("should increment count when button is clicked", async () => {
    define({
      tagName: "rid-counter",
      props: { count: 0 },
      template: (_props: any, state: any) => html`
        <div>
          <p>Count: ${state.count}</p>
          <button onclick=${() => state.count++}>+</button>
        </div>
      `,
    });

    document.body.innerHTML = "<rid-counter></rid-counter>";
    const counter = document.querySelector("rid-counter") as any;

    // Simulate button click
    const button = counter.shadowRoot.querySelector("button");
    button.click();

    // Wait for reactivity
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(counter.shadowRoot.querySelector("p").textContent).toBe("Count: 1");
  });
});
