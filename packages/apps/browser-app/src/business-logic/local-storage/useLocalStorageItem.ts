import { useCallback, useState } from "react";
import type WellKnownKey from "./WellKnownKey.js";

type UseLocalStorage<Value> = [
  value: Value,
  setValue: (newValue: Value) => void,
];

export default function useLocalStorageItem<Value>(
  key: WellKnownKey,
  initialValue: Value,
): UseLocalStorage<Value> {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });
  return [
    value,
    useCallback(
      (newValue) => {
        localStorage.setItem(key, JSON.stringify(newValue));
        setValue(newValue);
      },
      [key],
    ),
  ];
}
