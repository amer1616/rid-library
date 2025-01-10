import { describe, it, expect } from "vitest";
import { define } from "../src/rid";
import { Counter, counterProps } from "../src/components/rid-counter";

describe("<rid-counter> Component", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    define("rid-counter", Counter, { props: counterProps });
  });

  it("renders counter with initial count", () => {
    document.body.innerHTML = `<rid-counter count="5"></rid-counter>`;
    const counter = document.querySelector("rid-counter") as any;
    const paragraph = counter.shadowRoot.querySelector("p");

    expect(paragraph.textContent).toBe("Count: 5");
  });

  it("increments count on button click", async () => {
    document.body.innerHTML = `<rid-counter count="5"></rid-counter>`;
    const counter = document.querySelector("rid-counter") as any;
    const button = counter.shadowRoot.querySelector("button");

    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const paragraph = counter.shadowRoot.querySelector("p");
    expect(paragraph.textContent).toBe("Count: 6");
  });

  it("renders with optional label", () => {
    document.body.innerHTML = `<rid-counter count="0" label="Test Counter"></rid-counter>`;
    const counter = document.querySelector("rid-counter") as any;
    const label = counter.shadowRoot.querySelector("label");

    expect(label.textContent).toBe("Test Counter");
  });

  it("uses default count when not provided", () => {
    document.body.innerHTML = `<rid-counter></rid-counter>`;
    const counter = document.querySelector("rid-counter") as any;
    const paragraph = counter.shadowRoot.querySelector("p");

    expect(paragraph.textContent).toBe("Count: 0");
  });
});
