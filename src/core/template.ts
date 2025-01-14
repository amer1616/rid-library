// Template types
export interface TemplateResult {
  h: string;
  hs: HandlerInfo[];
}

export interface HandlerInfo {
  id: string;
  e: string;
  h: (event: Event) => void;
}

export type SupportedEvent =
  | "click"
  | "input"
  | "change"
  | "submit"
  | "keyup"
  | "keydown"
  | "blur"
  | "focus";

export type EventHandler = (event: Event) => void;

// Constants
const EVENT_ATTRIBUTE_PREFIX = "data-rid-h";
const ID_ATTRIBUTE_PREFIX = "data-rid-id";

// Helper functions
const processArrayValue = (val: any[]): { h: string; hs: HandlerInfo[] } => {
  let h = "";
  const hs: HandlerInfo[] = [];
  val.forEach((item) => {
    if (item?.h) {
      h += item.h;
      hs.push(...item.hs);
    } else {
      h += String(item);
    }
  });
  return { h, hs };
};

const processFunctionValue = (str: string, val: EventHandler, hs: HandlerInfo[]): { h: string; hs: HandlerInfo[] } => {
  const match = str.match(/\s(\??\w+)=$/);
  if (match) {
    const event = match[1].startsWith("?") ? match[1].slice(1) : match[1];
    const id = `h${hs.length}`;
    hs.push({ id, e: event, h: val });
    return { h: ` ${EVENT_ATTRIBUTE_PREFIX}="${event}" ${ID_ATTRIBUTE_PREFIX}="${id}"`, hs };
  }
  return { h: "", hs };
};

// Template engine
export const html = (
  strings: TemplateStringsArray,
  ...values: (string | number | EventHandler | { h: string; hs: HandlerInfo[] })[]
): TemplateResult => {
  let h = "";
  let hs: HandlerInfo[] = [];

  strings.forEach((str, i) => {
    h += str;
    if (i < values.length) {
      const val = values[i];
      if (Array.isArray(val)) {
        const { h: arrayH, hs: arrayHs } = processArrayValue(val);
        h += arrayH;
        hs.push(...arrayHs);
      } else if (typeof val === "function") {
        const { h: funcH, hs: funcHs } = processFunctionValue(str, val, hs);
        h += funcH;
        hs.push(...funcHs);
      } else if (val?.h) {
        h += val.h;
        hs.push(...val.hs);
      } else {
        h += val == null ? "" : String(val);
      }
    }
  });

  return { h, hs };
};

// Key function for list rendering
export const key = (
  key: string | number,
  template: TemplateResult
): TemplateResult => {
  const { h, hs } = template;
  return {
    h: h.replace(/^<(\w+)/, `<$1 key="${key}"`),
    hs,
  };
};

  return { h, hs };
};

// Key function for list rendering
export const key = (
  key: string | number,
  template: TemplateResult
): TemplateResult => {
  const { h, hs } = template;
  return {
    h: h.replace(/^<(\w+)/, `<$1 key="${key}"`),
    hs,
  };
};
