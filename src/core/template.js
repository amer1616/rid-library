import * as IncrementalDOM from 'incremental-dom';
import { 
  templateCache, 
  createMemo, 
  WeakCache, 
  createDebug, 
  measurePerformance,
  LRUCache 
} from './utils.js';

const debug = createDebug('Template');
const performance = createDebug('Performance');

const { elementOpen, elementClose, text, patch, attr } = IncrementalDOM;

// Enhanced caching system
const nodeCache = new WeakCache();
const renderCache = new WeakCache();
const attributeCache = new LRUCache(100);
const componentCache = new LRUCache(50);

// Error boundary for template rendering
const withErrorBoundary = (fn, errorHandler) => {
  try {
    return fn();
  } catch (error) {
    debug.error('Render error:', error);
    return errorHandler?.(error) ?? null;
  }
};

// Optimized template parsing
const parseTemplate = createMemo((str) => {
  return measurePerformance('parseTemplate', () => {
    const cached = templateCache.get(str);
    if (cached) {
      debug.log('Template cache hit');
      return cached;
    }

    debug.log('Parsing template');
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    
    templateCache.set(str, nodes);
    return nodes;
  });
}, {
  maxCacheSize: 100,
  ttl: 60000 // 1 minute
});

// Optimized attribute handling
const processAttributes = createMemo((attributes) => {
  return measurePerformance('processAttributes', () => {
    const key = JSON.stringify(Array.from(attributes));
    const cached = attributeCache.get(key);
    if (cached) return cached;

    const processed = Array.from(attributes).map(attr => ({
      name: attr.name,
      value: attr.value,
      isKey: attr.name === 'key'
    }));

    attributeCache.set(key, processed);
    return processed;
  });
});

// Enhanced node renderer
const createNodeRenderer = (node) => {
  return measurePerformance('createNodeRenderer', () => {
    if (node.nodeType === Node.TEXT_NODE) {
      return () => text(node.textContent);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const attributes = processAttributes(node.attributes);
      
      return () => withErrorBoundary(() => {
        const key = attributes.find(a => a.isKey)?.value;
        
        if (key) {
          elementOpen(tagName, key);
        } else {
          elementOpen(tagName);
        }
        
        attributes.forEach(({ name, value, isKey }) => {
          if (!isKey) {
            attr(name, value);
          }
        });
        
        elementClose(tagName);
      });
    }

    return () => {};
  });
};

// Optimized value processing
const processValue = (val, render) => {
  return measurePerformance('processValue', () => {
    // Handle observables
    if (typeof val === 'function' && val.subscribe) {
      const cached = renderCache.get(val);
      if (cached) return cached;

      const result = () => withErrorBoundary(() => {
        text(val.value);
        val.subscribe(render);
      });
      
      renderCache.set(val, result);
      return result;
    }

    // Handle components
    if (typeof val === 'function') {
      const cached = renderCache.get(val);
      if (cached) return cached;

      const result = () => withErrorBoundary(() => {
        const component = val();
        const container = document.createElement('div');
        patch(container, () => component);
      });
      
      renderCache.set(val, result);
      return result;
    }

    // Handle arrays
    if (Array.isArray(val)) {
      return () => withErrorBoundary(() => {
        val.forEach((item) => {
          if (typeof item === 'function' && item.subscribe) {
            text(item.value);
            item.subscribe(render);
          } else {
            text(item);
          }
        });
      });
    }

    // Handle primitive values
    return () => text(val);
  });
};

// Template literal tag function
export const html = (strings, ...values) => {
  debug.group('Creating template', () => {
    return () => {
      let renderCount = 0;
      
      const render = () => withErrorBoundary(() => {
        debug.log('Rendering template', { renderCount: ++renderCount });
        
        strings.forEach((str, index) => {
          if (str) {
            const nodes = parseTemplate(str);
            nodes.forEach((node) => {
              const renderer = nodeCache.get(node) || createNodeRenderer(node);
              nodeCache.set(node, renderer);
              renderer();
            });
          }

          if (index < values.length) {
            const valueRenderer = processValue(values[index], render);
            valueRenderer();
          }
        });
      });

      return render;
    };
  });
};

// Optimized rendering function
export const render = (container, component) => {
  debug.group('Rendering to container', () => {
    const key = component.toString();
    const cached = componentCache.get(key);
    
    if (cached) {
      debug.log('Using cached renderer');
      return patch(container, cached);
    }

    debug.log('Creating new renderer');
    const renderer = () => withErrorBoundary(
      () => component(),
      (error) => {
        console.error('Render error:', error);
        container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
      }
    );

    componentCache.set(key, renderer);
    patch(container, renderer);
  });
};

// Memory management
export const cleanup = () => {
  debug.group('Cleaning up resources', () => {
    attributeCache.clear();
    componentCache.clear();
    // WeakCache instances will be cleaned up by garbage collector
  });
};