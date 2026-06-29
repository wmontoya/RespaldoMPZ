import { useEffect, useState } from "react";

export const useLocalStorageEffect = (key: string, initialValue: any) => {
    const [storedValue, setStoredValue] = useState(initialValue);

    useEffect(() => {
        const item = localStorage.getItem(key);
        if (item) {
            setStoredValue(JSON.parse(item));
        }
    }, [key]);

    const setValue = (value: any) => {
        setStoredValue(value);
        localStorage.setItem(key, JSON.stringify(value));
    };

    return [storedValue, setValue] as const;
};
