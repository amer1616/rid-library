// LRU Cache implementation for efficient memory usage
export class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.usage = new Map();
    this.accessCount = 0;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    this.updateUsage(key);
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.capacity) {
      this.evictLeastUsed();
    }
    this.cache.set(key, value);
    this.updateUsage(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.usage.delete(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  updateUsage(key) {
    this.usage.set(key, ++this.accessCount);
  }

  evictLeastUsed() {
    let leastUsedKey = null;
    let leastUsedCount = Infinity;

    for (const [key, count] of this.usage) {
      if (count < leastUsedCount) {
        leastUsedKey = key;
        leastUsedCount = count;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.usage.delete(leastUsedKey);
    }
  }

  clear() {
    this.cache.clear();
    this.usage.clear();
    this.accessCount = 0;
  }
}

// WeakRef based cache for garbage collection friendly caching
export class WeakCache {
  constructor() {
    this.cache = new WeakMap();
    this.registry = new FinalizationRegistry(key => {
      this.cache.delete(key);
    });
  }

  set(key, value) {
    if (key === null || typeof key !== 'object') {
      throw new Error('WeakCache key must be an object');
    }
    this.cache.set(key, value);
    this.registry.register(value, key);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.cache.delete(key);
  }
}

// Resource pool for reusable objects
export class ResourcePool {
  constructor(factory, options = {}) {
    this.factory = factory;
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 30000;
    this.pool = new Set();
    this.inUse = new Map();
    this.lastCleanup = Date.now();
  }

  acquire() {
    this.cleanup();
    
    for (const resource of this.pool) {
      this.pool.delete(resource);
      this.inUse.set(resource, Date.now());
      return resource;
    }

    if (this.inUse.size >= this.maxSize) {
      this.cleanup(true);
    }

    const resource = this.factory();
    this.inUse.set(resource, Date.now());
    return resource;
  }

  release(resource) {
    if (this.inUse.has(resource)) {
      this.inUse.delete(resource);
      this.pool.add(resource);
    }
  }

  cleanup(force = false) {
    const now = Date.now();
    if (!force && now - this.lastCleanup < this.ttl) return;

    for (const [resource, timestamp] of this.inUse) {
      if (now - timestamp > this.ttl) {
        this.release(resource);
      }
    }

    while (this.pool.size > this.maxSize) {
      const oldestResource = this.pool.values().next().value;
      this.pool.delete(oldestResource);
    }

    this.lastCleanup = now;
  }
}

// Memoization with dependency tracking
export const createMemo = (fn, options = {}) => {
  const {
    maxCacheSize = 100,
    ttl = 5000,
    compareArgs = (prev, next) => 
      prev.length === next.length && 
      prev.every((arg, i) => arg === next[i])
  } = options;

  const cache = new LRUCache(maxCacheSize);
  const expirations = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached) {
      const expiration = expirations.get(key);
      if (expiration && Date.now() < expiration) {
        return cached;
      }
    }

    const result = fn(...args);
    cache.set(key, result);
    expirations.set(key, Date.now() + ttl);
    return result;
  };
};

// Performance measurement utilities
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (DEBUG) {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
};

// Debug utilities
const DEBUG = true;

export const createDebug = (name) => ({
  log: (...args) => DEBUG && console.log(`[${name}]`, ...args),
  group: (label, fn) => {
    if (!DEBUG) return fn();
    console.group(`[${name}] ${label}`);
    const result = fn();
    console.groupEnd();
    return result;
  },
  error: (...args) => DEBUG && console.error(`[${name}]`, ...args),
  warn: (...args) => DEBUG && console.warn(`[${name}]`, ...args),
  time: (label) => DEBUG && console.time(`[${name}] ${label}`),
  timeEnd: (label) => DEBUG && console.timeEnd(`[${name}] ${label}`)
});

// Component utilities
export const componentPool = new ResourcePool(() => ({}));
export const cleanupRegistry = new WeakCache();
export const templateCache = new WeakCache();
