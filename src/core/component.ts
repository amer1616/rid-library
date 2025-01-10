import { effect } from "./reactive";
import { type TemplateResult, type EventHandler } from "./template";
import {
  registerComponent,
  registerInstance,
  unregisterInstance,
  devErrors,
} from "./hmr";

// Prop type definitions
interface StringPropType {
  type: "string";
  required?: boolean;
  default?: string;
}

interface NumberPropType {
  type: "number";
  required?: boolean;
  default?: number;
}

interface BooleanPropType {
  type: "boolean";
  required?: boolean;
  default?: boolean;
}

interface ArrayPropType {
  type: "array";
  required?: boolean;
  default?: any[];
}

interface ObjectPropType {
  type: "object";
  required?: boolean;
  default?: object;
}

export type PropType =
  | StringPropType
  | NumberPropType
  | BooleanPropType
  | ArrayPropType
  | ObjectPropType;

export type PropTypes = Record<string, PropType>;

export interface ComponentOptions<P extends PropTypes> {
  props?: P;
  slots?: readonly string[] | string[];
}

type InferPropType<T extends PropType> = T extends StringPropType
  ? string
  : T extends NumberPropType
  ? number
  : T extends BooleanPropType
  ? boolean
  : T extends ArrayPropType
  ? any[]
  : T extends ObjectPropType
  ? object
  : never;

export type PropTypeToTSType<T extends PropTypes> = {
  [K in keyof T]: InferPropType<T[K]>;
};

export type ComponentFunction<P extends PropTypes = any> = (
  props: PropTypeToTSType<P>,
  slots: Record<string, HTMLElement[]>
) => TemplateResult;

const handlers = new Map<string, EventHandler>();

// Prop validation and conversion
const convertValue = (value: string | null, type: PropType["type"]): any => {
  if (value === null) return undefined;

  switch (type) {
    case "string":
      return value;
    case "number":
      return Number(value);
    case "boolean":
      return value === "" || value === "true";
    case "array":
    case "object":
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    default:
      return undefined;
  }
};

const validateProp = (
  componentName: string,
  name: string,
  value: any,
  propType: PropType
): any => {
  // Handle undefined/null when required
  if (propType.required && value == null) {
    throw new Error(devErrors.MISSING_REQUIRED_PROP(componentName, name));
  }

  // Use default value if provided and value is undefined
  if (value === undefined && "default" in propType) {
    return propType.default;
  }

  // Skip type checking if value is undefined/null and prop is not required
  if (value == null && !propType.required) {
    return value;
  }

  // Type checking
  switch (propType.type) {
    case "string":
      if (typeof value !== "string") {
        throw new Error(
          devErrors.INVALID_PROP_TYPE(componentName, name, "string", value)
        );
      }
      break;
    case "number":
      if (typeof value !== "number") {
        throw new Error(
          devErrors.INVALID_PROP_TYPE(componentName, name, "number", value)
        );
      }
      break;
    case "boolean":
      if (typeof value !== "boolean") {
        throw new Error(
          devErrors.INVALID_PROP_TYPE(componentName, name, "boolean", value)
        );
      }
      break;
    case "array":
      if (!Array.isArray(value)) {
        throw new Error(
          devErrors.INVALID_PROP_TYPE(componentName, name, "array", value)
        );
      }
      break;
    case "object":
      if (typeof value !== "object" || Array.isArray(value)) {
        throw new Error(
          devErrors.INVALID_PROP_TYPE(componentName, name, "object", value)
        );
      }
      break;
  }

  return value;
};

// Web Component definition with prop types and slots
export const define = <P extends PropTypes>(
  name: string,
  component: ComponentFunction<P>,
  options: ComponentOptions<P> = {}
) => {
  if (customElements.get(name)) return;

  const { props: propTypes = {} as P, slots: slotNames = [] } = options;

  // Register component for HMR
  registerComponent(name, component, propTypes, slotNames);

  customElements.define(
    name,
    class extends HTMLElement {
      private cleanup: (() => void) | null = null;
      private shadow: ShadowRoot;
      private props: Partial<PropTypeToTSType<P>> = {};
      private slots: Record<string, HTMLElement[]> = {};
      private eventCleanups: (() => void)[] = [];

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

        try {
          const convertedValue = convertValue(newValue, propType.type);
          if (convertedValue !== undefined) {
            const validatedValue = validateProp(
              this.tagName.toLowerCase(),
              name,
              convertedValue,
              propType
            );
            (this.props as any)[name] = validatedValue;
            this.requestUpdate();
          }
        } catch (error) {
          console.error(error);
        }
      }

      connectedCallback() {
        // Register instance for HMR
        registerInstance(name, this);

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
        this.requestUpdate();
      }

      disconnectedCallback() {
        // Unregister instance for HMR
        unregisterInstance(name, this);

        // Clean up event listeners
        this.eventCleanups.forEach((cleanup) => cleanup());
        this.eventCleanups = [];

        // Clean up reactive effects
        this.cleanup?.();
        this.cleanup = null;
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

      requestUpdate() {
        try {
          // Validate all props
          const validatedProps = Object.entries(propTypes).reduce(
            (acc, [name, propType]) => {
              const value = validateProp(
                this.tagName.toLowerCase(),
                name,
                this.props[name as keyof P],
                propType
              );
              (acc as any)[name] = value;
              return acc;
            },
            {} as PropTypeToTSType<P>
          );

          // Clean up previous event listeners
          this.eventCleanups.forEach((cleanup) => cleanup());
          this.eventCleanups = [];

          // Render component
          const cleanup = this.render(() => {
            try {
              return component(validatedProps, this.slots);
            } catch (error) {
              console.error(devErrors.COMPONENT_ERROR(name, error as Error));
              return { h: "", hs: [] };
            }
          });

          // Store cleanup function
          if (cleanup) {
            this.cleanup = cleanup;
          }
        } catch (error) {
          console.error(devErrors.TEMPLATE_ERROR(name, error as Error));
        }
      }

      private render(template: () => TemplateResult): (() => void) | null {
        if (typeof window === "undefined") return null; // Server-side: Do nothing

        const dispose = effect(() => {
          try {
            const { h, hs } = template();
            this.shadow.innerHTML = h;
            handlers.clear();

            // Set up event handlers
            hs.forEach(({ id, e, h }) => {
              handlers.set(id, h);
              const el = this.shadow.querySelector(`[data-rid-id="${id}"]`);
              if (el) {
                const listener = (event: Event) => h(event);
                el.addEventListener(e, listener);
                this.eventCleanups.push(() =>
                  el.removeEventListener(e, listener)
                );
              }
            });
          } catch (err) {
            console.error(devErrors.TEMPLATE_ERROR(name, err as Error));
          }
        });

        return dispose;
      }
    }
  );
};
