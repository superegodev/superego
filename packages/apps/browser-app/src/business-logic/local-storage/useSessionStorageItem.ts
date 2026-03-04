import { useCallback, useState } from "react";
import type WellKnownKey from "./WellKnownKey.js";

type UseSessionStorageItem<Value> = [
  value: Value,
  setValue: (newValue: Value) => void,
];

export default function useSessionStorageItem<Value>(
  key: WellKnownKey,
  initialValue: Value,
): UseSessionStorageItem<Value> {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });
  return [
    value,
    useCallback(
      (newValue) => {
        sessionStorage.setItem(key, JSON.stringify(newValue));
        setValue(newValue);
      },
      [key],
    ),
  ];
}
