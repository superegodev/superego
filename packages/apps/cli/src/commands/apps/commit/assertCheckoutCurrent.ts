import type { App } from "@superego/backend";
import type { AppLock } from "../common/types.js";

export default function assertCheckoutCurrent(lock: AppLock, app: App): void {
  if (lock.latestAppVersionId !== app.latestVersion.id) {
    throw new Error("Checkout is stale. Run apps status and checkout again.");
  }
}
