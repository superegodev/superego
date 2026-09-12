import type { AppState } from "@superego/backend";
export default function newestAppState(
  current: AppState | undefined,
  incoming: AppState,
): AppState {
  return current && current.revision > incoming.revision ? current : incoming;
}
