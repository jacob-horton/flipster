import { useState } from "react";

// https://github.com/microsoft/TypeScript/issues/37663
type ValOrGetter<T> = T | ((x: T) => T);
function isGetter<T>(valOrGetter: ValOrGetter<T>): valOrGetter is (x: T) => T {
    return typeof valOrGetter === "function";
}

function useStorage<T>(
    storage: Storage | undefined,
    key: string,
    defaultVal: T
) {
    const [val, setVal] = useState<T>(() => {
        if (storage === undefined) return defaultVal;

        const presentVal = storage.getItem(key);
        if (presentVal !== null) return JSON.parse(presentVal);

        storage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
    });

    function setValWrapper(newVal: T): void;
    function setValWrapper(newValGetter: (oldVal: T) => T): void;
    function setValWrapper(newValOrGetter: T | ((oldVal: T) => T)) {
        setVal((oldVal) => {
            let newVal;

            if (isGetter(newValOrGetter)) {
                newVal = newValOrGetter(oldVal);
            } else {
                newVal = newValOrGetter;
            }

            storage && storage.setItem(key, JSON.stringify(newVal));
            return newVal;
        });
    }

    return [val, setValWrapper] as const;
}

export function useSessionStorage(key: string, defaultVal: string) {
    const storage = typeof window !== "undefined" ? sessionStorage : undefined;
    return useStorage(storage, key, defaultVal);
}

export function useLocalStorage(key: string, defaultVal: string) {
    const storage = typeof window !== "undefined" ? localStorage : undefined;
    return useStorage(storage, key, defaultVal);
}
