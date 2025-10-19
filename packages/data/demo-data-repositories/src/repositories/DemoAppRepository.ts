import type { AppId } from "@superego/backend";
import type { AppEntity, AppRepository } from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoAppRepository
  extends Disposable
  implements AppRepository
{
  constructor(
    private apps: Data["apps"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insert(app: AppEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.apps[app.id] = clone(app);
  }

  async replace(app: AppEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.apps[app.id] = clone(app);
  }

  async delete(id: AppId): Promise<AppId> {
    this.ensureNotDisposed();
    this.onWrite();
    delete this.apps[id];
    return id;
  }

  async find(id: AppId): Promise<AppEntity | null> {
    this.ensureNotDisposed();
    return clone(this.apps[id] ?? null);
  }

  async findAll(): Promise<AppEntity[]> {
    this.ensureNotDisposed();
    return clone(
      Object.values(this.apps).sort((a, b) => (a.name >= b.name ? 1 : -1)),
    );
  }
}
