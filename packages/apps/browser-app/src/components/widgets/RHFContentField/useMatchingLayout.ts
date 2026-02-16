import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import { useEffect, useState } from "react";

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
  const [layout, setLayout] = useState<
    DefaultDocumentViewUiOptions.Layout | undefined
  >(() => resolveLayout(rootLayout));

  useEffect(() => {
    if (!rootLayout) {
      setLayout(undefined);
      return;
    }

    const entries = Object.entries(rootLayout);
    const mediaQueryLists = entries.map(([expr]) => window.matchMedia(expr));

    const update = () => setLayout(resolveLayout(rootLayout));

    for (const mediaQueryList of mediaQueryLists) {
      mediaQueryList.addEventListener("change", update);
    }

    update();

    return () => {
      for (const mediaQueryList of mediaQueryLists) {
        mediaQueryList.removeEventListener("change", update);
      }
    };
  }, [rootLayout]);

  return layout;
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
