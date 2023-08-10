import { useState } from "react";

function useStorage(storage: Storage, key: string, defaultVal: string) {
    const [val, setVal] = useState<string>(() => {
        const presentVal = storage.getItem(key);
        if (presentVal !== null) return presentVal;
        storage.setItem(key, defaultVal);
        return defaultVal;
    });

    function setValWrapper(newVal: string): void;
    function setValWrapper(newValGetter: (oldVal: string) => string): void;
    function setValWrapper(
        newValOrGetter: string | ((oldVal: string) => string)
    ) {
        setVal((oldVal) => {
            let newVal;

            if (typeof newValOrGetter === "string") {
                newVal = newValOrGetter;
            } else {
                newVal = newValOrGetter(oldVal);
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
    clear() {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getItem(_: string) {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key(_: number) {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    removeItem(_: string) {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    setItem(_: string, __: string) {}
}

export function useSessionStorage(key: string, defaultVal: string) {
    let storage;
    if (typeof window !== "undefined") {
        storage = sessionStorage;
    } else {
        storage = new dummyStorage();
    }

    return useStorage(storage, key, defaultVal);
}

export function useLocalStorage(key: string, defaultVal: string) {
    let storage;
    if (typeof window !== "undefined") {
        storage = localStorage;
    } else {
        storage = new dummyStorage();
    }

    return useStorage(storage, key, defaultVal);
}
