let effectStack = [];
let isBatching = false;
let batchedUpdates = new Set();

const createSubscriptionManager = () => {
  const subscribers = new Set();
  const subscribe = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };
  const notify = () => {
    if (isBatching) {
      batchedUpdates.add(() => subscribers.forEach((subscriber) => subscriber()));
    } else {
      subscribers.forEach((subscriber) => subscriber());
    }
  };
  return { subscribe, notify };
};

export const atom = (initialValue) => {
  let value = initialValue;
  const { subscribe, notify } = createSubscriptionManager();

  const get = () => {
    if (effectStack.length > 0) {
      const currentEffect = effectStack[effectStack.length - 1];
      if (!currentEffect.dependencies) {
        currentEffect.dependencies = new Set();
      }
      currentEffect.dependencies.add({ subscribe: (fn) => subscribers.add(fn) });
    }
    return value;
  };

  const set = (newValue) => {
    if (value !== newValue) {
      value = newValue;
      notify();
    }
  };

  return {
    get value() {
      return get();
    },
    set value(newValue) {
      set(newValue);
    },
    subscribe,
    get() {
      return get();
    },
    set(newValue) {
      set(newValue);
    },
  };
};

export const computed = (dependencies, computeFn) => {
  const computedAtom = atom(computeFn());

  const update = () => {
    effectStack.push(update);
    currentEffect = update;
    computedAtom.set(computeFn());
    effectStack.pop();
    currentEffect = effectStack[effectStack.length - 1];
  };

  dependencies.forEach((dep) => dep.subscribe(update));
  update();

  return computedAtom;
};

export const effect = (effectFn, dependencies) => {
  const execute = () => {
    if (execute.dependencies) {
      execute.dependencies.forEach((dep) => dep.unsubscribe(execute));
    }
    execute.dependencies = new Set();

    effectStack.push(execute);
    currentEffect = execute;
    effectFn();
    effectStack.pop();
    currentEffect = effectStack[effectStack.length - 1];
  };

  dependencies.forEach((dep) => dep.subscribe(execute));
  execute();

  return () => {
    if (execute.dependencies) {
      execute.dependencies.forEach((dep) => dep.unsubscribe(execute));
    }
  };
};

export const batch = (callback) => {
  if (isBatching) {
    callback();
    return;
  }

  isBatching = true;
  callback();
  isBatching = false;

  batchedUpdates.forEach((update) => update());
  batchedUpdates.clear();
};