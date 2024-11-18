// Reactive system using Proxy

type CB = () => void;
const depsMap = new Map<object, Map<string | symbol, Set<CB>>>();
let activeEffect: CB | null = null;

const reactive = <T extends object>(obj: T): T =>
  new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      if (activeEffect) {
        let deps = depsMap.get(target) || new Map();
        if (!deps.has(key)) deps.set(key, new Set());
        deps.get(key)!.add(activeEffect);
        depsMap.set(target, deps);
      }
      return typeof res === "object" && res !== null ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      const old = Reflect.get(target, key, receiver);
      const res = Reflect.set(target, key, value, receiver);
      if (old !== value) {
        const deps = depsMap.get(target)?.get(key);
        deps?.forEach((cb) => cb());
      }
      return res;
    },
  });

// Effect registration
const effect = (fn: CB) => {
  const wrapped: CB = () => {
    cleanup(wrapped);
    activeEffect = wrapped;
    fn();
    activeEffect = null;
  };
  wrapped();
};

// Cleanup dependencies
const cleanup = (effectFn: CB) => {
  depsMap.forEach((deps) => {
    deps.forEach((set) => set.delete(effectFn));
  });
};

export interface TemplateResult {
  h: string;
  hs: { id: string; e: keyof HTMLElementEventMap; h: CB }[];
}

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

const handlers = new Map<string, CB>();

// Render function using Incremental DOM with event delegation
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

  const listener = (event: Event) => {
    const target = event.target as HTMLElement;
    const el = target.closest(`[data-rid-h][data-rid-id]`);
    if (el) {
      // const eventName = el.getAttribute(
      //   "data-rid-h"
      // ) as keyof HTMLElementEventMap;
      const handlerId = el.getAttribute("data-rid-id")!;
      const handler = handlers.get(handlerId);
      handler?.();
    }
  };

  el.addEventListener("click", listener);
  // Add other event listeners as needed (e.g., 'input', 'change')

  return () => {
    el.removeEventListener("click", listener);
  };
};

export { reactive, effect, html, render };
