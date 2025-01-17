import { effect } from './store.js';
import { 
  createMemo, 
  componentPool, 
  cleanupRegistry, 
  WeakCache, 
  LRUCache, 
  createDebug,
  measurePerformance 
} from './utils.js';

// Initialize caches and debug utilities
const componentCache = new LRUCache(50);
const instanceCache = new WeakCache();
const propsCache = new WeakCache();
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();
const performance = createDebug('Performance');

const cleanupComponents = () => {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    componentCache.clear();
    componentPool.cleanup();
    lastCleanup = now;
  }
};

export const createComponent = (Component) => {
  cleanupComponents();
  
  const memoizedComponent = createMemo(
    (props = {}) => {
      const cacheKey = JSON.stringify(props);
      const cached = componentCache.get(cacheKey);
      if (cached) return cached;

      const instance = componentPool.acquire();
      const result = Component(props);
      
      componentCache.set(cacheKey, result);
      instanceCache.set(result, instance);
      propsCache.set(instance, props);
      
      cleanupRegistry.register(instance, () => {
        componentPool.release(instance);
        componentCache.delete(cacheKey);
      });
      
      return result;
    }
  );

  return memoizedComponent;
};

export const onMount = (callback) => {
  const cleanup = effect(() => {
    const cleanupFn = callback();
    return () => {
      cleanupFn?.();
    };
  }, []);

  cleanupRegistry.register({}, cleanup);
};

export const onUnmount = (callback) => {
  effect(() => {
    return () => callback();
  }, []);
};

export const memo = (component, compareProps = (prev, next) => {
  return measurePerformance('compareProps', () => {
    if (!prev || !next) return false;
    return Object.keys(prev).length === Object.keys(next).length &&
           Object.keys(prev).every(key => prev[key] === next[key]);
  });
}) => {
  const memoized = createMemo(
    (props) => component(props),
    { compareArgs: ([prevProps], [nextProps]) => compareProps(prevProps, nextProps) }
  );
  
  return (props) => memoized(props);
};

export const lazy = (loader) => {
  let component = null;
  let loading = false;
  let error = null;
  const cache = new LRUCache(50);

  return async (props) => {
    if (component) {
      const cacheKey = JSON.stringify(props);
      const cached = cache.get(cacheKey);
      if (cached) return cached;
      
      const result = component(props);
      cache.set(cacheKey, result);
      return result;
    }

    if (!loading) {
      loading = true;
      try {
        component = await measurePerformance(
          'LazyLoad',
          async () => await loader()
        );
      } catch (e) {
        error = e;
      }
      loading = false;
    }

    return error ? ErrorBoundary(() => {}, error) : null;
  };
};

export const debug = (component) => {
  const debugger = createDebug(component.name);
  return (props) => {
    debugger.log('Props:', props);
    return measurePerformance(
      component.name,
      () => component(props)
    );
  };
};

export const ErrorBoundary = (component, fallback) => {
  const debug = createDebug('ErrorBoundary');
  const errorCache = new WeakCache();
  
  return (...args) => {
    try {
      const result = component(...args);
      if (errorCache.has(component)) {
        debug.log('Component recovered from error');
        errorCache.delete(component);
      }
      return result;
    } catch (error) {
      debug.log('Component error:', error);
      errorCache.set(component, error);
      return fallback(error);
    }
  };
};