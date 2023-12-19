import { useState } from "react";

function useStorage(storage: Storage, key: string, defaultVal: string) {
  const [val, setVal] = useState<string | null>(() => {
    storage.setItem(key, defaultVal);
    return defaultVal
  });

  function setValWrapper(newValGetter: string | ((oldVal: string | null) => string)) {
    setVal((oldVal) => {
      let newVal;

      if (typeof newValGetter === 'string') {
        newVal = newValGetter;
      } else {
        newVal = newValGetter(oldVal);
      }

      storage.setItem(key, newVal);
      return newVal;
    });
  }

  return [val, setValWrapper] as const;
}


class dummyStorage implements Storage {
  readonly length = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clear() { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getItem(_: string) { return null; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  key(_: number) { return null; }
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  removeItem(_: string) { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  setItem(_: string, __: string) { }
}

export function useSessionStorage(key: string, defaultVal: string) {
  let storage;
  if (typeof window !== 'undefined') {
    storage = sessionStorage;
  } else {
    storage = new dummyStorage();
  }

  return useStorage(storage, key, defaultVal)
}

export function useLocalStorage(key: string, defaultVal: string) {
  let storage;
  if (typeof window !== 'undefined') {
    storage = sessionStorage;
  } else {
    storage = new dummyStorage();
  }

  return useStorage(storage, key, defaultVal)
}
