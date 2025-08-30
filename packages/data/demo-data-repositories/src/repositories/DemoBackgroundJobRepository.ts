import type { BackgroundJobId } from "@superego/backend";
import type {
  BackgroundJobEntity,
  BackgroundJobRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoBackgroundJobRepository
  extends Disposable
  implements BackgroundJobRepository
{
  constructor(
    private backgroundJobs: Data["backgroundJobs"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insert(backgroundJob: BackgroundJobEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.backgroundJobs[backgroundJob.id] = clone(backgroundJob);
  }

  async replace(backgroundJob: BackgroundJobEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.backgroundJobs[backgroundJob.id] = clone(backgroundJob);
  }

  async find(id: BackgroundJobId): Promise<BackgroundJobEntity | null> {
    this.ensureNotDisposed();
    return clone(this.backgroundJobs[id] ?? null);
  }

  async findAll(): Promise<BackgroundJobEntity[]> {
    this.ensureNotDisposed();
    return clone(Object.values(this.backgroundJobs));
  }
}
