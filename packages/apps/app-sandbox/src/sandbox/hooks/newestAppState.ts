import type { AppState } from "@superego/backend";
export default function newestAppState(
  current: AppState | undefined,
  incoming: AppState,
): AppState {
  return current &&
    current.schemaId === incoming.schemaId &&
    current.revision > incoming.revision
    ? current
    : incoming;
}
