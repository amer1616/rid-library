import { effect } from './store';

export const createComponent = (Component) => {
  return (props = {}) => {
    return Component(props);
  };
};

export const onMount = (callback) => {
  effect(() => {
    callback();
    return () => {};
  }, []);
};

export const onUnmount = (callback) => {
  effect(() => {
    return () => callback();
  }, []);
};

export const memo = (component) => {
  let cachedProps = null;
  let cachedResult = null;
  return (props) => {
    if (cachedProps === props) {
      return cachedResult;
    }
    cachedProps = props;
    cachedResult = component(props);
    return cachedResult;
  };
};

export const lazy = (loader) => {
  let component = null;
  return () => {
    if (!component) {
      component = loader();
    }
    return component;
  };
};

export const debug = (component) => {
  return (props) => {
    console.log('Component:', component.name);
    console.log('Props:', props);
    return component(props);
  };
};

export const ErrorBoundary = (component, fallback) => {
  try {
    return component();
  } catch (error) {
    return fallback(error);
  }
};