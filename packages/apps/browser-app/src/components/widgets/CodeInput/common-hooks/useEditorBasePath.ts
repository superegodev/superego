import { useMemo } from "react";

/**
 * Gets a unique base path for the editor instance.
 *
 * Each editor instance creates models under a different base path. This sort-of
 * allows multiple instances of the editor to exist at the same time, though
 * they still share the same virtual filesystem.
 */
export default function useEditorBasePath() {
  return useMemo(() => `vfs:/${crypto.randomUUID()}`, []);
}
