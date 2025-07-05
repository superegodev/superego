import type { GlobalSettings } from "@superego/backend";
import type { GlobalSettingsRepository } from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoGlobalSettingsRepository
  extends Disposable
  implements GlobalSettingsRepository
{
  constructor(
    private globalSettings: Data["globalSettings"],
    private onWrite: () => void,
  ) {
    super();
  }

  async replace(globalSettings: GlobalSettings): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.globalSettings.value = clone(globalSettings);
  }

  async get(): Promise<GlobalSettings> {
    this.ensureNotDisposed();
    return clone(this.globalSettings.value);
  }
}
