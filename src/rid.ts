// src/rid.ts

type CB = () => void;
type EMap = HTMLElementEventMap;

const t = new WeakMap<
  object,
  Map<string | symbol | number | undefined, Set<CB>>
>();
let a: CB | null = null;

const reactive = <T extends object>(o: T): T =>
  new Proxy(o, {
    get(target, key, r) {
      const res = Reflect.get(target, key, r);
      if (a) {
        let deps = t.get(target) || new Map();
        if (!deps.has(key)) deps.set(key, new Set());
        deps.get(key)!.add(a);
        t.set(target, deps);
      }
      return typeof res === "object" && res !== null ? reactive(res) : res;
    },
    set(target, key, v, r) {
      const o = (target as any)[key];
      const res = Reflect.set(target, key, v, r);
      if (o !== v) {
        t.get(target)
          ?.get(key)
          ?.forEach((cb) => cb());
      }
      return res;
    },
  });

const effect = (fn: CB): CB => {
  const e = () => {
    cleanup(e);
    a = e;
    fn();
    a = null;
  };
  e();
  return e;
};

const cleanup = (e: CB) => {
  t.forEach((deps: any) => deps.forEach((set: any) => set.delete(e)));
};

// Template result interface
interface TR {
  h: string;
  hs: { id: string; e: keyof EMap; h: CB }[];
}

// Handler mapping
let handlerId = 0;
const handlers = new Map<string, CB>();

// Supported event types
const supportedEvents: (keyof EMap)[] = ["click", "input", "keydown", "change"];

// Flag to ensure listeners are attached only once per container
const listenersAttached = new WeakSet<HTMLElement>();

// HTML templating with event handling
const html = (s: TemplateStringsArray, ...v: any[]): TR => {
  let h = "",
    hs: { id: string; e: keyof EMap; h: CB }[] = [];
  s.forEach((str, i) => {
    h += str;
    if (i < v.length) {
      const val = v[i];
      if (typeof val === "function") {
        const m = str.match(/on([A-Za-z]+)/);
        const e = m ? (m[1].toLowerCase() as keyof EMap) : "click";
        if (supportedEvents.includes(e)) {
          const id = `h${handlerId++}`;
          h += ` data-rid-h="${e}" data-rid-id="${id}"`;
          hs.push({ id, e, h: val });
        } else {
          h += val;
        }
      } else {
        h += val;
      }
    }
  });
  return { h, hs };
};

// Render function using Incremental DOM with event delegation
const render = (c: HTMLElement, tmpl: () => TR): (() => void) => {
  // Attach event listeners only once per container
  if (!listenersAttached.has(c)) {
    supportedEvents.forEach((e) => {
      c.addEventListener(e, (event) => {
        const target = event.target as HTMLElement;
        const el = target.closest(`[data-rid-h="${e}"][data-rid-id]`);
        if (el) {
          const id = el.getAttribute("data-rid-id")!;
          const handler = handlers.get(id);
          if (handler) handler();
        }
      });
    });
    listenersAttached.add(c);
  }

  const u = () => {
    try {
      const { h, hs } = tmpl();
      c.innerHTML = h;
      handlers.clear();
      hs.forEach(({ id, h }) => {
        handlers.set(id, h);
      });
    } catch (err) {
      console.error("Render error:", err);
    }
  };
  const d = effect(u);
  return () => d();
};

export { reactive, effect, html, render };
