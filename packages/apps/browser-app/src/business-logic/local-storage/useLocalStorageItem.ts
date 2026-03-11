import { useCallback, useState } from "react";
import type WellKnownKey from "./WellKnownKey.js";

type UseLocalStorageItem<Value> = [
  value: Value,
  setValue: (newValue: Value | ((prev: Value) => Value)) => void,
];

export default function useLocalStorageItem<Value>(
  key: WellKnownKey,
  initialValue: Value,
): UseLocalStorageItem<Value> {
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
      (newValueOrUpdater: Value | ((previousValue: Value) => Value)) => {
        setValue((previousValue: Value) => {
          const newValue =
            typeof newValueOrUpdater === "function"
              ? (newValueOrUpdater as (previousValue: Value) => Value)(
                  previousValue,
                )
              : newValueOrUpdater;
          localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      },
      [key],
    ),
  ];
}
