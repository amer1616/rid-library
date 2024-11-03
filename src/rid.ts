// src/rid.ts

type CB = () => void;
// type EMap = HTMLElementEventMap;

// Reactive system using Proxy

const t = new Map<object, Map<string | symbol, Set<CB>>>();
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

// Effect registration
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

// Cleanup dependencies
const cleanup = (e: CB) => {
  t.forEach((deps: any) => deps.forEach((set: any) => set.delete(e)));
};

// Template result interface
// interface TR {
//   h: string;
//   hs: { id: string; e: keyof EMap; h: CB }[];
// }

// Handler mapping
// let handlerId = 0;
// const handlers = new Map<string, CB>();

// // Supported event types
// const supportedEvents: (keyof EMap)[] = ["click", "input", "keydown", "change"];

// // Flag to ensure listeners are attached only once per container
// const listenersAttached = new WeakSet<HTMLElement>();

/// HTML templating with event handling and array support
const html = (s: TemplateStringsArray, ...v: any[]) => {
  let h = "",
    hs: { id: string; e: keyof HTMLElementEventMap; h: CB }[] = [];
  s.forEach((str, i) => {
    h += str;
    if (i < v.length) {
      const val = v[i];
      if (Array.isArray(val)) {
        val.forEach((item: any) => {
          h += item.h;
          hs.push(...item.hs);
        });
      } else if (typeof val === "function") {
        const m = str.match(/on([A-Za-z]+)/);
        const e = m
          ? (m[1].toLowerCase() as keyof HTMLElementEventMap)
          : "click";
        const id = `h${hs.length}`;
        h += ` data-rid-h="${e}" data-rid-id="${id}"`;
        hs.push({ id, e, h: val });
      } else {
        h += val;
      }
    }
  });
  return { h, hs };
};
// Render function using Incremental DOM with event delegation
const render = (
  c: HTMLElement,
  tmpl: () => { h: string; hs: any[] }
): (() => void) => {
  if (typeof window === "undefined") return () => {};
  let u = () => {
    try {
      const { h, hs } = tmpl();
      c.innerHTML = h;
      hs.forEach(({ id, e, h }) => {
        const el = c.querySelector(`[data-rid-id="${id}"]`);
        if (el) el.addEventListener(e, h);
      });
    } catch (err) {
      console.error("Render error:", err);
    }
  };
  return effect(u);
};

// const render = (c: HTMLElement, tmpl: () => TR): (() => void) => {
//   // Attach event listeners only once per container
//   if (!listenersAttached.has(c)) {
//     supportedEvents.forEach((e) => {
//       c.addEventListener(e, (event) => {
//         const target = event.target as HTMLElement;
//         const el = target.closest(`[data-rid-h="${e}"][data-rid-id]`);
//         if (el) {
//           const id = el.getAttribute("data-rid-id")!;
//           const handler = handlers.get(id);
//           if (handler) handler();
//         }
//       });
//     });
//     listenersAttached.add(c);
//   }

//   const u = () => {
//     try {
//       const { h, hs } = tmpl();
//       c.innerHTML = h;
//       handlers.clear();
//       hs.forEach(({ id, h }) => {
//         handlers.set(id, h);
//       });
//     } catch (err) {
//       console.error("Render error:", err);
//     }
//   };
//   const d = effect(u);
//   return () => d();
// };

// define custom element for web components
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

export { reactive, effect, html, render, define };
