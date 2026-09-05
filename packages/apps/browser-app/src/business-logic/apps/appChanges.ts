import type { AppId } from "@superego/backend";

/** Only invalidation signals cross windows; no definitions or state are shared.
 * Query caches remain scoped to each backend/iframe. App IDs are globally unique;
 * a copied database can at most receive a harmless extra invalidation.
 */
export function announceAppChange(appId: AppId) {
  if (typeof BroadcastChannel === "undefined") {
    return;
  }
  const channel = new BroadcastChannel(`superego:app:${appId}`);
  channel.postMessage(null);
  channel.close();
}
export function subscribeAppChanges(appId: AppId, callback: () => void) {
  if (typeof BroadcastChannel === "undefined") {
    return () => {};
  }
  const channel = new BroadcastChannel(`superego:app:${appId}`);
  channel.onmessage = () => callback();
  return () => channel.close();
}
