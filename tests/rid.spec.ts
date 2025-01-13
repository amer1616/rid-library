import { reactive, effect, html } from "@rid/index";

describe("RID Library Core Tests", () => {
  it("should create a reactive object", () => {
    const state = reactive({ count: 0 });
    let value = 0;

    effect(() => {
      value = state.count;
    });

    state.count++;
    expect(value).toBe(1); // Check reactivity
  });

  it("should generate HTML with event listeners", () => {
    const template = html`<button onclick=${() => console.log("clicked")}>
      Click
    </button>`;
    expect(template.h).toContain("button");
  });
});
