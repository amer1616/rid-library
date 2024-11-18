import { render, TemplateResult } from "./rid";

export const define = (
  tagName: string,
  component: (props: Record<string, any>) => TemplateResult
) => {
  if (customElements.get(tagName)) return;

  class CustomElement extends HTMLElement {
    props: Record<string, any> = {};

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.initializeProps();
    }

    static get observedAttributes() {
      return [];
    }

    attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
      this.props[name] = newValue;
      this.update();
    }

    connectedCallback() {
      this.update();
    }

    initializeProps() {
      Array.from(this.attributes).forEach((attr) => {
        this.props[attr.name] = attr.value;
      });
    }

    update() {
      const template = component(this.props);
      if (this.shadowRoot) {
        render(this.shadowRoot, () => template);
      }
    }
  }

  customElements.define(tagName, CustomElement);
};
