import { effect } from "./reactive";
import {
  SUPPORTED_EVENTS,
  type TemplateResult,
  type SupportedEvent,
  type EventHandler,
} from "./template";

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

const validateProp = (name: string, value: any, propType: PropType): any => {
  // Handle undefined/null when required
  if (propType.required && value == null) {
    throw new Error(`Prop "${name}" is required but was not provided`);
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
        throw new Error(`Prop "${name}" must be a string`);
      }
      break;
    case "number":
      if (typeof value !== "number") {
        throw new Error(`Prop "${name}" must be a number`);
      }
      break;
    case "boolean":
      if (typeof value !== "boolean") {
        throw new Error(`Prop "${name}" must be a boolean`);
      }
      break;
    case "array":
      if (!Array.isArray(value)) {
        throw new Error(`Prop "${name}" must be an array`);
      }
      break;
    case "object":
      if (typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`Prop "${name}" must be an object`);
      }
      break;
  }

  return value;
};

// Render function using event delegation
const render = (
  el: ShadowRoot | HTMLElement,
  template: () => TemplateResult
): (() => void) => {
  if (typeof window === "undefined") return () => {}; // Server-side: Do nothing

  effect(() => {
    try {
      const { h, hs } = template();
      el.innerHTML = h;
      handlers.clear();
      hs.forEach(({ id, h }) => handlers.set(id, h));
    } catch (err) {
      console.error("Render error:", err);
    }
  });

  const eventListeners = new Map<SupportedEvent, (event: Event) => void>();

  const createListener = (eventType: SupportedEvent) => (event: Event) => {
    const target = event.target as HTMLElement;
    const el = target.closest(`[data-rid-h="${eventType}"][data-rid-id]`);
    if (el) {
      const handlerId = el.getAttribute("data-rid-id")!;
      const handler = handlers.get(handlerId);
      handler?.(event);
    }
  };

  // Setup event delegation for all supported events
  SUPPORTED_EVENTS.forEach((eventType) => {
    const listener = createListener(eventType);
    eventListeners.set(eventType, listener);
    el.addEventListener(eventType, listener);
  });

  // Cleanup function to remove all event listeners
  return () => {
    eventListeners.forEach((listener, eventType) => {
      el.removeEventListener(eventType, listener);
    });
  };
};

// Web Component definition with prop types and slots
export const define = <P extends PropTypes>(
  name: string,
  component: (
    props: PropTypeToTSType<P>,
    slots: Record<string, HTMLElement[]>
  ) => TemplateResult,
  options: ComponentOptions<P> = {}
) => {
  if (customElements.get(name)) return;

  const { props: propTypes = {} as P, slots: slotNames = [] } = options;

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

        const convertedValue = convertValue(newValue, propType.type);
        if (convertedValue !== undefined) {
          const validatedValue = validateProp(name, convertedValue, propType);
          (this.props as any)[name] = validatedValue;
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
        // Validate all props
        const validatedProps = Object.entries(propTypes).reduce(
          (acc, [name, propType]) => {
            const value = validateProp(
              name,
              this.props[name as keyof P],
              propType
            );
            (acc as any)[name] = value;
            return acc;
          },
          {} as PropTypeToTSType<P>
        );

        this.cleanup = render(this.shadow, () =>
          component(validatedProps, this.slots)
        );
      }
    }
  );
};
