import { effect, reactive, render } from "./rid";

const define = ({
  tagName,
  props = {},
  template,
  styles = "",
  handlers = {},
}: {
  tagName: string;
  props?: Record<string, any>;
  template: (
    props: Record<string, any>,
    state: any
  ) => { h: string; hs: any[] };
  styles?: string;
  handlers?: Record<string, EventListener>;
}) => {
  const CustomEl = class extends HTMLElement {
    state = reactive({ ...props });
    private renderTmpl: () => void;

    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      if (styles) shadow.innerHTML += `<style>${styles}</style>`;

      this.renderTmpl = () => {
        const { h, hs } = template(this.state, this.state);
        render(shadow.host as HTMLElement, () => ({ h, hs }));
      };
      effect(this.renderTmpl);
      Object.keys(handlers).forEach((e) =>
        this.addEventListener(e, handlers[e])
      );
      Object.keys(props).forEach((p) =>
        Object.defineProperty(this, p, {
          get: () => this.state[p],
          set: (v) => {
            this.state[p] = v;
            this.renderTmpl();
          },
        })
      );
    }
    connectedCallback() {
      this.renderTmpl();
    }

    static get observedAttributes() {
      return Object.keys(props);
    }
    attributeChangedCallback(n: string, _o: any, nv: any) {
      if (n in this.state) this.state[n] = nv;
    }
  };
  customElements.define(tagName, CustomEl);
};

export { define };
