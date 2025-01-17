// store.js
import { 
  createDebug, 
  measurePerformance, 
  LRUCache, 
  WeakCache,
  createMemo 
} from './utils.js';

const debug = createDebug('Store');
const performance = createDebug('Performance');

// Shared state cache with LRU eviction
const stateCache = new LRUCache(100);
const subscriptionCache = new WeakCache();

// Deep object utilities
export const map = {
  isObject: (val) => val !== null && typeof val === "object" && !Array.isArray(val),
  
  isDeepObject: (val) => 
    map.isObject(val) || (Array.isArray(val) && val.some(map.isDeepObject)),
  
  clone: (obj) => measurePerformance('clone', () => {
    if (!map.isObject(obj) && !Array.isArray(obj)) return obj;
    if (Array.isArray(obj)) return obj.map(map.clone);
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, map.clone(v)])
    );
  }),
  
  equal: (a, b) => measurePerformance('equal', () => {
    if (a === b) return true;
    if (!map.isObject(a) || !map.isObject(b)) return a === b;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return keysA.length === keysB.length && 
           keysA.every(key => map.equal(a[key], b[key]));
  }),
  
  get: (obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((value, key) => value?.[key], obj);
  },
  
  set: (obj, path, value) => measurePerformance('set', () => {
    if (!path) return value;
    const parts = path.split('.');
    const result = map.clone(obj);
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      current[key] = map.clone(current[key]) || {};
      current = current[key];
    }
    
    current[parts[parts.length - 1]] = value;
    return result;
  })
};

// Batching mechanism
const batch = {
  queue: new Set(),
  depth: 0,
  
  start() {
    this.depth++;
    debug.log('Starting batch', { depth: this.depth });
  },
  
  end() {
    this.depth--;
    debug.log('Ending batch', { depth: this.depth });
    if (this.depth === 0) {
      this.flush();
    }
  },
  
  add(fn) {
    if (this.depth > 0) {
      this.queue.add(fn);
      debug.log('Added to batch queue', { queueSize: this.queue.size });
    } else {
      fn();
    }
  },
  
  flush() {
    debug.group('Flushing batch', () => {
      this.queue.forEach(fn => fn());
      this.queue.clear();
    });
  }
};

// Event system
const createEvents = () => {
  const listeners = new Set();
  return {
    listen: (fn) => {
      listeners.add(fn);
      debug.log('Added listener', { totalListeners: listeners.size });
      return () => {
        listeners.delete(fn);
        debug.log('Removed listener', { totalListeners: listeners.size });
      };
    },
    emit: () => batch.add(() => {
      debug.group('Emitting events', () => {
        listeners.forEach(fn => {
          try {
            fn();
          } catch (error) {
            debug.error('Listener error:', error);
          }
        });
      });
    })
  };
};

// Atomic state
export const atom = (initialValue, name = 'atom') => {
  const atomDebug = createDebug(`Atom:${name}`);
  let value = map.clone(initialValue);
  const events = createEvents();
  
  const instance = {
    get: (path) => {
      const result = map.get(value, path);
      atomDebug.log('get', { path, result });
      return result;
    },
    
    set: (newValue, path) => {
      atomDebug.group('set', () => {
        atomDebug.log('previous', value);
        atomDebug.log('new', newValue);
        atomDebug.log('path', path);
        
        const updated = path ? 
          map.set(value, path, newValue) : 
          map.clone(newValue);
        
        if (!map.equal(value, updated)) {
          value = updated;
          events.emit();
        }
      });
    },
    
    listen: events.listen,
    
    select: (selectorFn) => {
      const selector = createMemo(
        () => selectorFn(value),
        { maxCacheSize: 1, compareArgs: () => true }
      );
      
      return {
        get: () => selector(),
        listen: (fn) => events.listen(() => {
          const newValue = selector();
          fn(newValue);
        })
      };
    }
  };

  // Cache the instance
  const key = JSON.stringify({ name, initialValue });
  stateCache.set(key, instance);
  
  return instance;
};

// Computed values
export const computed = (fn, deps) => {
  const computedDebug = createDebug('Computed');
  const result = atom(fn(), 'computed');
  
  deps.forEach(dep => {
    dep.listen(() => {
      computedDebug.group('Update', () => {
        try {
          result.set(fn());
        } catch (error) {
          computedDebug.error('Computation error:', error);
        }
      });
    });
  });
  
  return result;
};

// Side effects
export const effect = (fn, deps = []) => {
  const effectDebug = createDebug('Effect');
  
  const cleanup = () => {
    if (typeof lastResult === 'function') {
      effectDebug.log('Cleaning up');
      lastResult();
    }
  };
  
  let lastResult;
  const run = () => {
    cleanup();
    effectDebug.group('Run', () => {
      try {
        lastResult = fn();
      } catch (error) {
        effectDebug.error('Effect error:', error);
      }
    });
  };
  
  deps.forEach(dep => dep.listen(run));
  run();
  
  return cleanup;
};

// Store events
export const storeEvents = {
  mounted: new Set(),
  unmounted: new Set(),
  
  onMount: (fn) => {
    debug.log('Adding mount handler');
    storeEvents.mounted.add(fn);
    return () => {
      debug.log('Removing mount handler');
      storeEvents.mounted.delete(fn);
    };
  },
  
  onUnmount: (fn) => {
    debug.log('Adding unmount handler');
    storeEvents.unmounted.add(fn);
    return () => {
      debug.log('Removing unmount handler');
      storeEvents.unmounted.delete(fn);
    };
  },
  
  triggerMount: () => {
    debug.group('Triggering mount', () => {
      storeEvents.mounted.forEach(fn => {
        try {
          fn();
        } catch (error) {
          debug.error('Mount handler error:', error);
        }
      });
    });
  },
  
  triggerUnmount: () => {
    debug.group('Triggering unmount', () => {
      storeEvents.unmounted.forEach(fn => {
        try {
          fn();
        } catch (error) {
          debug.error('Unmount handler error:', error);
        }
      });
    });
  }
};

// Batch utility
export const transaction = (fn) => {
  batch.start();
  try {
    fn();
  } catch (error) {
    debug.error('Transaction error:', error);
    throw error;
  } finally {
    batch.end();
  }
};
