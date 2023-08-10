import { useState } from "react";

function useStorage(
    storage: Storage | undefined,
    key: string,
    defaultVal: string
) {
    const [val, setVal] = useState<string>(() => {
        if (storage === undefined) return defaultVal;

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

            storage && storage.setItem(key, newVal);
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
