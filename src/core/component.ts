import { TemplateResult } from "./template";
import { state, effect } from "./state";

type PropType = {
  type:
    | "string"
    | "number"
    | "boolean"
    | "array"
    | "object"
    | "function"
    | "children";
  required?: boolean;
  default?: any;
  validate?: (value: any) => boolean;
};

export type PropTypes = Record<string, PropType>;
type Props<P extends PropTypes> = {
  [K in keyof P]: P[K] extends PropType & { required: true }
    ? PropTypeToValue<P[K]>
    : PropTypeToValue<P[K]> | undefined;
} & {
  children?: HTMLElement[];
};

type PropTypeToValue<T extends PropType> = T["type"] extends "string"
  ? string
  : T["type"] extends "number"
    ? number
    : T["type"] extends "boolean"
      ? boolean
      : T["type"] extends "array"
        ? any[]
        : T["type"] extends "object"
          ? object
          : T["type"] extends "function"
            ? Function
            : T["type"] extends "children"
              ? any
              : never;

interface Options<P extends PropTypes> {
  props?: P;
  shadow?: boolean;
}

export const define = <P extends PropTypes>(
  name: string,
  render: (props: Props<P>) => TemplateResult,
  options: Options<P> = {}
) => {
  if (customElements.get(name)) return;
  const { props: propTypes = {} as P, shadow = true } = options;

  class Component extends HTMLElement {
    private root: ShadowRoot | HTMLElement;
    private cleanup?: () => void;
    private observer: MutationObserver;

    private state = state({
      props: {} as Props<P>,
    });

    constructor() {
      super();
      this.root = shadow ? this.attachShadow({ mode: "open" }) : this;
      this.observer = new MutationObserver(() => this.updateChildren());
    }

    connectedCallback() {
      this.initProps();
      this.observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      this.updateChildren();
      this.setupReactivity();
    }

    disconnectedCallback() {
      this.cleanup?.();
      this.observer.disconnect();
    }

    private initProps() {
      // Initialize from attributes and defaults
      Object.entries(propTypes).forEach(([name, type]) => {
        if (this.hasAttribute(name)) {
          this.updateProp(name, this.getAttribute(name));
        } else if ("default" in type) {
          (this.state.props as any)[name] = type.default;
        }
      });
    }

    private updateChildren() {
      if (
        propTypes &&
        "children" in propTypes &&
        propTypes.children.type === "children"
      ) {
        this.state.props.children = Array.from(this.children) as HTMLElement[];
      }
    }

    private setupReactivity() {
      this.cleanup = effect(() => {
        const result = render(this.state.props as Props<P>);
        this.root.innerHTML = result.h;
        result.hs.forEach(({ id, e, h }) => {
          const el = this.root.querySelector(`[data-rid-id="${id}"]`);
          el?.addEventListener(e, h);
        });
      });
    }

    static get observedAttributes() {
      return Object.keys(propTypes);
    }

    attributeChangedCallback(
      name: string,
      _: string | null,
      value: string | null
    ) {
      this.updateProp(name, value);
    }

    private updateProp(name: string, value: string | null) {
      const type = propTypes[name];
      if (!type) return;

      let parsed: any = value;
      switch (type.type) {
        case "number":
          parsed = value === null ? null : Number(value);
          break;
        case "boolean":
          parsed = value !== null;
          break;
        case "array":
        case "object":
          try {
            parsed = value === null ? undefined : JSON.parse(value);
          } catch {
            parsed = type.default;
          }
          break;
      }

      if (type.validate?.(parsed) === false) {
        parsed = type.default;
      }

      (this.state.props as any)[name] = parsed;
    }
  }

  customElements.define(name, Component);
};
