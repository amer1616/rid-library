// tests/counter.spec.ts
import { describe, it, expect } from "vitest";
import { define } from "@rid/main";
import { Counter } from "../src/components/rid-counter";

describe("<rid-counter> Component", () => {
  beforeEach(() => {
    // Define the component
    define("rid-counter", Counter);
  });

  it("renders MyCounter component with initial count", () => {
    document.body.innerHTML = `<rid-counter count="5"></rid-counter>`;
    const counter = document.querySelector("rid-counter") as any;
    const paragraph = counter.shadowRoot.querySelector("p");

    expect(paragraph.textContent).toBe("Count: 5");
  });

  it("increments count in MyCounter component on button click", async () => {
    document.body.innerHTML = `<rid-counter count="5"></rid-counter>`;
    const counter = document.querySelector("rid-counter") as any;
    const button = counter.shadowRoot.querySelector("button");

    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const paragraph = counter.shadowRoot.querySelector("p");
    expect(paragraph.textContent).toBe("Count: 6");
  });
});
