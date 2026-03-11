import { useCallback, useState } from "react";
import type WellKnownKey from "./WellKnownKey.js";

type UseSessionStorageItem<Value> = [
  value: Value,
  setValue: (newValue: Value | ((prev: Value) => Value)) => void,
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
      (newValueOrUpdater: Value | ((previousValue: Value) => Value)) => {
        setValue((previousValue: Value) => {
          const newValue =
            typeof newValueOrUpdater === "function"
              ? (newValueOrUpdater as (previousValue: Value) => Value)(
                  previousValue,
                )
              : newValueOrUpdater;
          sessionStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      },
      [key],
    ),
  ];
}
