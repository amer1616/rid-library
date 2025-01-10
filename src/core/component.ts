import { TemplateResult } from "./template";

// Prop type definitions
interface StringPropType<T extends string = string> {
  type: "string";
  required?: boolean;
  default?: T;
  validate?: (value: string) => value is T;
}

interface NumberPropType {
  type: "number";
  required?: boolean;
  default?: number;
  validate?: (value: number) => boolean;
}

interface BooleanPropType {
  type: "boolean";
  required?: boolean;
  default?: boolean;
}

interface ArrayPropType<T = any> {
  type: "array";
  required?: boolean;
  default?: T[];
  validate?: (value: T[]) => boolean;
}

interface ObjectPropType<T = object> {
  type: "object";
  required?: boolean;
  default?: T;
  validate?: (value: T) => boolean;
}

interface FunctionPropType {
  type: "function";
  required?: boolean;
}

export type PropType =
  | StringPropType
  | NumberPropType
  | BooleanPropType
  | ArrayPropType
  | ObjectPropType
  | FunctionPropType;

export type PropTypes = Record<string, PropType>;

export interface ComponentOptions<P extends PropTypes> {
  props?: P;
  slot?: readonly string[] | string[];
}

type InferPropType<T extends PropType> = T extends StringPropType<infer S>
  ? S
  : T extends NumberPropType
  ? number
  : T extends BooleanPropType
  ? boolean
  : T extends ArrayPropType<infer A>
  ? A[]
  : T extends ObjectPropType<infer O>
  ? O
  : T extends FunctionPropType
  ? Function
  : never;

export type PropTypeToTSType<T extends PropTypes> = {
  [K in keyof T]: T[K] extends { required: true }
    ? InferPropType<T[K]>
    : InferPropType<T[K]> | undefined;
};

export type ComponentFunction<P extends PropTypes = any> = (
  props: PropTypeToTSType<P>,
  slot: Record<string, HTMLElement[]>
) => TemplateResult;

// Web Component definition with prop types and slots
export const define = <P extends PropTypes>(
  name: string,
  component: ComponentFunction<P>,
  options: ComponentOptions<P> = {}
) => {
  if (customElements.get(name)) return;

  const { props: propTypes = {} as P, slot: slotNames = [] } = options;

  customElements.define(
    name,
    class extends HTMLElement {
      private cleanup: (() => void) | null = null;
      private shadow: ShadowRoot;
      private props: Partial<PropTypeToTSType<P>> = {};
      private slots: Record<string, HTMLElement[]> = {};

      constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
      }

      static get observedAttributes() {
        return Object.keys(propTypes);
      }

      attributeChangedCallback(
        name: string,
        _oldValue: string | null,
        newValue: string | null
      ) {
        const propType = propTypes[name];
        if (!propType) return;

        let value: any = newValue;

        // Convert value based on type
        switch (propType.type) {
          case "number":
            value = newValue === null ? undefined : Number(newValue);
            if (propType.validate && !propType.validate(value)) {
              console.warn(`Invalid value for prop "${name}": ${value}`);
              value = propType.default;
            }
            break;
          case "boolean":
            value = newValue !== null;
            break;
          case "array":
            try {
              value = newValue === null ? undefined : JSON.parse(newValue);
              if (propType.validate && !propType.validate(value)) {
                console.warn(`Invalid value for prop "${name}": ${value}`);
                value = propType.default;
              }
            } catch {
              value = propType.default;
            }
            break;
          case "object":
            try {
              value = newValue === null ? undefined : JSON.parse(newValue);
              if (propType.validate && !propType.validate(value)) {
                console.warn(`Invalid value for prop "${name}": ${value}`);
                value = propType.default;
              }
            } catch {
              value = propType.default;
            }
            break;
          case "function":
            try {
              value =
                newValue === null
                  ? undefined
                  : new Function("return " + newValue)();
            } catch {
              value = undefined;
            }
            break;
          case "string":
            if (propType.validate && !propType.validate(value)) {
              console.warn(`Invalid value for prop "${name}": ${value}`);
              value = propType.default;
            }
            break;
        }

        // Use default if value is undefined
        if (value === undefined && "default" in propType) {
          value = propType.default;
        }

        // Update prop if valid
        if (value !== undefined || !propType.required) {
          (this.props as any)[name] = value;
          this.update();
        }
      }

      connectedCallback() {
        // Initialize props from attributes
        Array.from(this.attributes).forEach((attr) => {
          const name = attr.name;
          const propType = propTypes[name];
          if (propType) {
            this.attributeChangedCallback(name, null, attr.value);
          }
        });

        // Initialize default values for props
        Object.entries(propTypes).forEach(([name, propType]) => {
          if (!(name in this.props) && "default" in propType) {
            (this.props as any)[name] = propType.default;
          }
        });

        // Initialize slots
        this.initializeSlots();
        this.update();
      }

      disconnectedCallback() {
        this.cleanup?.();
      }

      private initializeSlots() {
        // Default slot
        const defaultSlotContent = Array.from(this.children).filter(
          (child) => !child.hasAttribute("slot")
        );
        if (defaultSlotContent.length > 0) {
          this.slots["default"] = Array.from(
            defaultSlotContent
          ) as HTMLElement[];
        }

        // Named slots
        slotNames.forEach((slotName) => {
          const slottedElements = Array.from(this.children).filter(
            (child) => child.getAttribute("slot") === slotName
          );
          if (slottedElements.length > 0) {
            this.slots[slotName] = Array.from(slottedElements) as HTMLElement[];
          }
        });
      }

      private update() {
        this.cleanup = render(this.shadow, () =>
          component(this.props as PropTypeToTSType<P>, this.slots)
        );
      }
    }
  );
};

// Internal render function
const render = (
  el: ShadowRoot,
  template: () => TemplateResult
): (() => void) => {
  if (typeof window === "undefined") return () => {}; // Server-side: Do nothing

  const result = template();
  el.innerHTML = result.h;

  // Set up event handlers
  result.hs.forEach(({ id, e, h }) => {
    const element = el.querySelector(`[data-rid-id="${id}"]`);
    if (element) {
      element.addEventListener(e, h);
    }
  });

  // Return cleanup function
  return () => {
    result.hs.forEach(({ id, e, h }) => {
      const element = el.querySelector(`[data-rid-id="${id}"]`);
      if (element) {
        element.removeEventListener(e, h);
      }
    });
  };
};
