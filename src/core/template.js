import * as IncrementalDOM from 'incremental-dom';
const { elementOpen, elementClose, text, patch, attr } = IncrementalDOM;

const templateCache = new Map();

const parseTemplate = (str) => {
  if (templateCache.has(str)) return templateCache.get(str);

  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  const nodes = Array.from(doc.body.childNodes);
  templateCache.set(str, nodes);
  return nodes;
};

export const html = (strings, ...values) => {
  return () => {
    let i = 0;
    const render = () => {
      strings.forEach((str, index) => {
        if (str) {
          const nodes = parseTemplate(str);
          nodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              text(node.textContent);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const tagName = node.tagName.toLowerCase();
              const key = node.getAttribute('key');
              if (key) {
                elementOpen(tagName, key);
              } else {
                elementOpen(tagName);
              }
              Array.from(node.attributes).forEach((attr) => {
                if (attr.name !== 'key') {
                  IncrementalDOM.attr(attr.name, attr.value);
                }
              });
              elementClose(tagName);
            }
          });
        }

        if (index < values.length) {
          const val = values[index];
          if (typeof val === 'function' && val.subscribe) {
            text(val.value);
            val.subscribe(render);
          } else if (typeof val === 'function') {
            const component = val();
            patch(document.createElement('div'), () => component);
          } else if (Array.isArray(val)) {
            val.forEach((item) => {
              if (typeof item === 'function' && item.subscribe) {
                text(item.value);
                item.subscribe(render);
              } else {
                text(item);
              }
            });
          } else {
            text(val);
          }
        }
      });
    };
    return render;
  };
};

export const render = (container, component) => {
  patch(container, () => component());
};