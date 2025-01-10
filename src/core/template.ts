// Common DOM events that we support
export const SUPPORTED_EVENTS = [
  "click",
  "input",
  "change",
  "submit",
  "keydown",
  "keyup",
  "keypress",
  "mouseenter",
  "mouseleave",
  "mouseover",
  "mouseout",
  "mousemove",
  "mousedown",
  "mouseup",
  "focus",
  "blur",
  "touchstart",
  "touchend",
  "touchmove",
  "drag",
  "dragstart",
  "dragend",
  "dragenter",
  "dragleave",
  "dragover",
  "drop",
  "paste",
  "cut",
  "copy",
] as const;

export type SupportedEvent = (typeof SUPPORTED_EVENTS)[number];
export type EventHandler = (event: Event) => void;

export interface TemplateResult {
  h: string;
  hs: { id: string; e: SupportedEvent; h: EventHandler }[];
  keys?: Map<string, string>; // Map of key to element id
}

const isTemplateResult = (value: any): value is TemplateResult => {
  return value && typeof value === "object" && "h" in value && "hs" in value;
};

const escapeHtml = (str: string) => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const processValue = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "boolean") return val ? "true" : "false";
  return escapeHtml(String(val));
};

const extractEventName = (attr: string): SupportedEvent | null => {
  if (attr.startsWith("on")) {
    const eventName = attr.slice(2).toLowerCase();
    return SUPPORTED_EVENTS.includes(eventName as SupportedEvent)
      ? (eventName as SupportedEvent)
      : null;
  }
  return null;
};

interface KeyedItem {
  key: string;
  template: TemplateResult;
}

const processKeyedArray = (
  items: KeyedItem[],
  hs: { id: string; e: SupportedEvent; h: EventHandler }[]
): string => {
  const keys = new Map<string, string>();
  let html = "";

  items.forEach(({ key, template }) => {
    const elementId = `e${hs.length}`;
    keys.set(key, elementId);

    // Add data-rid-key attribute for efficient updates
    html += template.h.replace(
      /^(<[^>]+)/,
      `$1 data-rid-key="${key}" data-rid-id="${elementId}"`
    );

    // Merge event handlers and update their ids
    template.hs.forEach((handler) => {
      hs.push({
        id: `${elementId}_${handler.id}`,
        e: handler.e,
        h: handler.h,
      });
    });
  });

  return html;
};

const processArrayValue = (
  val: any[],
  hs: { id: string; e: SupportedEvent; h: EventHandler }[],
  getKey?: (item: any, index: number) => string
): string => {
  if (!getKey) {
    return val
      .map((item) => {
        if (isTemplateResult(item)) {
          hs.push(...item.hs);
          return item.h;
        }
        return processValue(item);
      })
      .join("");
  }

  // Handle keyed arrays
  const keyedItems: KeyedItem[] = val.map((item, index) => ({
    key: getKey(item, index),
    template: isTemplateResult(item)
      ? item
      : {
          h: processValue(item),
          hs: [],
          keys: new Map(),
        },
  }));

  return processKeyedArray(keyedItems, hs);
};

/// HTML templating with event handling and keyed array support
export const html = (s: TemplateStringsArray, ...v: any[]): TemplateResult => {
  let h = "",
    hs: { id: string; e: SupportedEvent; h: EventHandler }[] = [];
  const keys = new Map<string, string>();

  s.forEach((str, i) => {
    h += str;
    if (i < v.length) {
      const val = v[i];

      if (Array.isArray(val)) {
        // Check if this is a keyed map call
        const keyMatch = str.match(
          /\$\{([^}]+)\.map\(\([^,]+,\s*[^)]+\)\s*=>\s*[^}]+,\s*([^}]+)\)/
        );
        const getKey = keyMatch
          ? (item: any) => String(item[keyMatch[2]])
          : undefined;
        h += processArrayValue(val, hs, getKey);
      } else if (typeof val === "function") {
        const match = str.match(/\s(\??\w+)=$/);
        if (match) {
          const [, attr] = match;
          const isBoolean = attr.startsWith("?");
          const cleanAttr = isBoolean ? attr.slice(1) : attr;
          const eventName = extractEventName(cleanAttr);

          if (eventName) {
            const id = `h${hs.length}`;
            h += ` data-rid-h="${eventName}" data-rid-id="${id}"`;
            hs.push({ id, e: eventName, h: val });
          }
        }
      } else if (isTemplateResult(val)) {
        h += val.h;
        hs.push(...val.hs);
        if (val.keys) {
          val.keys.forEach((v, k) => keys.set(k, v));
        }
      } else if (str.endsWith("<style>") && typeof val === "string") {
        h += val; // Don't escape style content
      } else {
        h += processValue(val);
      }
    }
  });

  return { h, hs, keys };
};

// Helper for keyed iterations
export const key = (key: string, template: TemplateResult): TemplateResult => {
  const elementId = `k${key}`;
  return {
    h: template.h.replace(
      /^(<[^>]+)/,
      `$1 data-rid-key="${key}" data-rid-id="${elementId}"`
    ),
    hs: template.hs.map((h) => ({ ...h, id: `${elementId}_${h.id}` })),
    keys: new Map([[key, elementId]]),
  };
};
