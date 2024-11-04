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

// define custom element for web components

export { reactive, effect, html, render };
