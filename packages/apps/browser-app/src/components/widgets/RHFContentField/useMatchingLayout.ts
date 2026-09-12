import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import { useCallback, useSyncExternalStore } from "react";

type RootLayout = DefaultDocumentViewUiOptions["rootLayout"];

/**
 * Resolves a responsive rootLayout record to the first matching Layout.
 * Evaluates media feature expressions via window.matchMedia() and listens for
 * changes. Returns undefined if no expression matches or if rootLayout is
 * nullish.
 */
export default function useMatchingLayout(
  rootLayout: RootLayout | null,
): DefaultDocumentViewUiOptions.Layout | undefined {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!rootLayout) {
        return () => {};
      }

      const entries = Object.entries(rootLayout);
      const mediaQueryLists = entries.map(([expr]) => window.matchMedia(expr));

      for (const mediaQueryList of mediaQueryLists) {
        mediaQueryList.addEventListener("change", onChange);
      }

      return () => {
        for (const mediaQueryList of mediaQueryLists) {
          mediaQueryList.removeEventListener("change", onChange);
        }
      };
    },
    [rootLayout],
  );

  const getSnapshot = useCallback(
    () => resolveLayout(rootLayout),
    [rootLayout],
  );
  return useSyncExternalStore(subscribe, getSnapshot);
}

function resolveLayout(
  rootLayout: RootLayout | null,
): DefaultDocumentViewUiOptions.Layout | undefined {
  if (!rootLayout) {
    return undefined;
  }

  for (const [mediaFeatureExpression, layout] of Object.entries(rootLayout)) {
    if (window.matchMedia(mediaFeatureExpression).matches) {
      return layout;
    }
  }

  return undefined;
}
