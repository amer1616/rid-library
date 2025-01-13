import { describe, it, expect, beforeEach } from "vitest";
import { define } from "../src/rid";
import { Form } from "../examples/form/rid-form";

describe("<rid-form> Component", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    define("rid-form", Form);
  });

  it("renders form with all input fields", () => {
    document.body.innerHTML = `<rid-form></rid-form>`;
    const form = document.querySelector("rid-form") as any;
    const shadowRoot = form.shadowRoot;

    expect(shadowRoot.querySelector("#username")).toBeTruthy();
    expect(shadowRoot.querySelector("#email")).toBeTruthy();
    expect(shadowRoot.querySelector("#bio")).toBeTruthy();
    expect(shadowRoot.querySelector('input[type="checkbox"]')).toBeTruthy();
    expect(shadowRoot.querySelector(".skills-dropzone")).toBeTruthy();
  });

  it("updates username on input", async () => {
    document.body.innerHTML = `<rid-form></rid-form>`;
    const form = document.querySelector("rid-form") as any;
    const shadowRoot = form.shadowRoot;

    const input = shadowRoot.querySelector("#username") as HTMLInputElement;
    input.value = "testuser";
    input.dispatchEvent(new Event("input"));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input.value).toBe("testuser");
  });

  it("updates email on input", async () => {
    document.body.innerHTML = `<rid-form></rid-form>`;
    const form = document.querySelector("rid-form") as any;
    const shadowRoot = form.shadowRoot;

    const input = shadowRoot.querySelector("#email") as HTMLInputElement;
    input.value = "test@example.com";
    input.dispatchEvent(new Event("input"));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input.value).toBe("test@example.com");
  });

  it("updates bio on keyup", async () => {
    document.body.innerHTML = `<rid-form></rid-form>`;
    const form = document.querySelector("rid-form") as any;
    const shadowRoot = form.shadowRoot;

    const textarea = shadowRoot.querySelector("#bio") as HTMLTextAreaElement;
    textarea.value = "Test bio content";
    textarea.dispatchEvent(new Event("keyup"));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(textarea.value).toBe("Test bio content");
  });

  it("toggles newsletter subscription", async () => {
    document.body.innerHTML = `<rid-form></rid-form>`;
    const form = document.querySelector("rid-form") as any;
    const shadowRoot = form.shadowRoot;

    const checkbox = shadowRoot.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change"));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(checkbox.checked).toBe(true);
  });

  it("handles skill drop", async () => {
    document.body.innerHTML = `<rid-form></rid-form>`;
    const form = document.querySelector("rid-form") as any;
    const shadowRoot = form.shadowRoot;

    const dropzone = shadowRoot.querySelector(".skills-dropzone");

    // Create a mock drag event
    const dropEvent = new Event("drop") as any;
    dropEvent.preventDefault = () => {};
    dropEvent.dataTransfer = {
      getData: () => "JavaScript",
    };

    dropzone.dispatchEvent(dropEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const skillTag = shadowRoot.querySelector(".skill-tag");
    expect(skillTag).toBeTruthy();
    expect(skillTag.textContent).toBe("JavaScript");
  });

  it("prevents duplicate skills", async () => {
    document.body.innerHTML = `<rid-form></rid-form>`;
    const form = document.querySelector("rid-form") as any;
    const shadowRoot = form.shadowRoot;

    const dropzone = shadowRoot.querySelector(".skills-dropzone");

    // Drop the same skill twice
    const dropEvent = new Event("drop") as any;
    dropEvent.preventDefault = () => {};
    dropEvent.dataTransfer = {
      getData: () => "JavaScript",
    };

    dropzone.dispatchEvent(dropEvent);
    dropzone.dispatchEvent(dropEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const skillTags = shadowRoot.querySelectorAll(".skill-tag");
    expect(skillTags.length).toBe(1);
    expect(skillTags[0].textContent).toBe("JavaScript");
  });

  it("handles form submission", async () => {
    document.body.innerHTML = `<rid-form></rid-form>`;
    const form = document.querySelector("rid-form") as any;
    const shadowRoot = form.shadowRoot;

    const formElement = shadowRoot.querySelector("form");

    // Mock console.log to capture form data
    const originalConsoleLog = console.log;
    let capturedData: any;
    console.log = (...args: any[]) => {
      if (args[0] === "Form submitted:") {
        capturedData = args[1];
      }
    };

    formElement.dispatchEvent(new Event("submit"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(capturedData).toBeTruthy();
    expect(capturedData.username).toBe("");
    expect(capturedData.email).toBe("");
    expect(capturedData.bio).toBe("");
    expect(capturedData.newsletter).toBe(false);
    expect(Array.isArray(capturedData.skills)).toBe(true);

    // Restore console.log
    console.log = originalConsoleLog;
  });
});
