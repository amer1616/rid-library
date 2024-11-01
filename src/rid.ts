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

interface TemplateResult {
  html: string;
  handlers: { event: keyof EMap; handler: CB }[];
}

const html = (
  strings: TemplateStringsArray,
  ...values: any[]
): TemplateResult => {
  let html = "";
  const handlers: { event: keyof EMap; handler: CB }[] = [];
  strings.forEach((str, i) => {
    html += str;
    if (i < values.length) {
      const val = values[i];
      if (typeof val === "function") {
        const m = str.match(/on([A-Za-z]+)/);
        const e = m ? (m[1].toLowerCase() as keyof EMap) : "click";
        const id = `__h${i}__`;
        html += ` data-${e}="${id}"`;
        handlers.push({ event: e, handler: val });
      } else {
        html += val;
      }
    }
  });
  return { html, handlers };
};

const render = (c: HTMLElement, tmpl: () => TemplateResult): (() => void) => {
  const u = () => {
    try {
      const { html: tpl, handlers } = tmpl();
      c.innerHTML = tpl;
      handlers.forEach(({ event, handler }, i) => {
        const id = `__h${i}__`;
        const el = c.querySelector(`[data-${event}="${id}"]`);
        if (el) {
          el.addEventListener(event, handler);
          el.removeAttribute(`data-${event}`);
        }
      });
    } catch (err) {
      console.error("Render error:", err);
    }
  };
  const d = effect(u);
  return () => d();
};

export { reactive, effect, html, render };
