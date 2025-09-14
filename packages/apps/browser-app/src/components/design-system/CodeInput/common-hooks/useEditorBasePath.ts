import { useMemo } from "react";

/**
 * Gets a unique base path for the editor instance.
 *
 * Each editor instance creates models under a different base path. This sort-of
 * allows multiple instances of the editor to exist at the same time, though
 * they still share the same virtual filesystem. But we don't usually expect
 * many instances to exist at the same time, as each instance is disposed
 * onBlur. This is not always done immediately, though. Typescript instances are
 * disposed only after their last compilation completed. So, if in the meantime
 * another instance has been created, there is a brief period in which two
 * instances coexist. We we want to create a new instance every time isShown
 * changes, hence why we make isShown a dependency of useMemo.
 */
export default function useEditorBasePath(isShown: boolean) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  return useMemo(() => `vfs:/${crypto.randomUUID()}`, [isShown]);
}
