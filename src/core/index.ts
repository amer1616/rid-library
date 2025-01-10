// Types
type Fn = () => void;
type Deps = Map<object, Map<string | symbol, Set<Fn>>>;
type H = { id: string; h: (e: Event) => void };
type T = { h: string; hs: H[] };
type S = Record<string, HTMLElement[]>;

// Reactive system
const d: Deps = new Map();
let e: Fn | null = null;

// Create reactive proxy
export const r = <T extends object>(o: T): T =>
  new Proxy(o, {
    get: (t, k, c) => {
      const v = Reflect.get(t, k, c);
      if (e) {
        let m = d.get(t);
        if (!m) {
          m = new Map();
          d.set(t, m);
        }
        let s = m.get(k);
        if (!s) {
          s = new Set();
          m.set(k, s);
        }
        s.add(e);
      }
      return typeof v === "object" && v ? r(v) : v;
    },
    set: (t, k, v, c) => {
      const o = Reflect.get(t, k, c);
      const r = Reflect.set(t, k, v, c);
      if (o !== v)
        d.get(t)
          ?.get(k)
          ?.forEach((e) => e());
      return r;
    },
  });

// Effect with cleanup
export const f = (fn: Fn): Fn => {
  const w: Fn = () => {
    c(w);
    e = w;
    fn();
    e = null;
  };
  w();
  return () => c(w);
};

// Cleanup
const c = (fn: Fn): void => d.forEach((m) => m.forEach((s) => s.delete(fn)));

// Template engine
export const h = (s: TemplateStringsArray, ...v: any[]): T => {
  let h = "",
    hs: H[] = [];
  s.forEach((str, i) => {
    h += str;
    if (i < v.length) {
      const val = v[i];
      if (Array.isArray(val)) {
        h += val.map((i) => i?.h || String(i)).join("");
        val.forEach((i) => i?.hs && hs.push(...i.hs));
      } else if (typeof val === "function") {
        const m = str.match(/\s(\??\w+)=$/);
        if (m) {
          const id = `h${hs.length}`;
          h += ` data-rid-h="${m[1]}" data-rid-id="${id}"`;
          hs.push({ id, h: val });
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

// Component definition
export const define = (
  n: string,
  c: (p: Record<string, any>, s: S) => T,
  o: { props?: Record<string, any> } = {}
): void => {
  if (customElements.get(n)) return;

  customElements.define(
    n,
    class extends HTMLElement {
      private p: Record<string, any> = {};
      private s: S = {};
      private x: Fn | null = null;

      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }

      connectedCallback() {
        this.s = Array.from(this.children).reduce((acc: S, el) => {
          const slot = el.getAttribute("slot") || "default";
          if (!acc[slot]) acc[slot] = [];
          acc[slot].push(el as HTMLElement);
          return acc;
        }, {});
        this.update();
      }

      disconnectedCallback() {
        this.x?.();
      }

      update() {
        this.x = f(() => {
          const { h, hs } = c(this.p, this.s);
          if (this.shadowRoot) {
            this.shadowRoot.innerHTML = h;
            hs.forEach(({ id, h }) => {
              const el = this.shadowRoot?.querySelector(
                `[data-rid-id="${id}"]`
              );
              const event = id.split("-")[0];
              el?.addEventListener(event, h);
            });
          }
        });
      }
    }
  );
};
