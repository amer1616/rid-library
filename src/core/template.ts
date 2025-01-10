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

// Template engine
export const html = (
  strings: TemplateStringsArray,
  ...values: any[]
): TemplateResult => {
  let h = "",
    hs: HandlerInfo[] = [];

  strings.forEach((str, i) => {
    h += str;
    if (i < values.length) {
      const val = values[i];
      if (Array.isArray(val)) {
        h += val.map((i) => i?.h || String(i)).join("");
        val.forEach((i) => i?.hs && hs.push(...i.hs));
      } else if (typeof val === "function") {
        const m = str.match(/\s(\??\w+)=$/);
        if (m) {
          const id = `h${hs.length}`;
          const event = m[1].startsWith("?") ? m[1].slice(1) : m[1];
          h += ` data-rid-h="${event}" data-rid-id="${id}"`;
          hs.push({ id, e: event, h: val });
        }
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
