import type { AppId, AppVersionId } from "@superego/backend";
import type {
  AppVersionEntity,
  AppVersionRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoAppVersionRepository
  extends Disposable
  implements AppVersionRepository
{
  constructor(
    private appVersions: Data["appVersions"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insert(appVersion: AppVersionEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.appVersions[appVersion.id] = clone(appVersion);
  }

  async deleteAllWhereAppIdEq(appId: AppId): Promise<AppVersionId[]> {
    this.ensureNotDisposed();
    this.onWrite();
    const deletedIds: AppVersionId[] = [];
    Object.values(this.appVersions).forEach((appVersion) => {
      if (appVersion.appId === appId) {
        delete this.appVersions[appVersion.id];
        deletedIds.push(appVersion.id);
      }
    });
    return deletedIds;
  }

  async findLatestWhereAppIdEq(appId: AppId): Promise<AppVersionEntity | null> {
    this.ensureNotDisposed();
    const [latestAppVersion] = Object.values(this.appVersions)
      .filter((appVersion) => appVersion.appId === appId)
      .sort((a, b) =>
        a.createdAt < b.createdAt
          ? 1
          : a.createdAt > b.createdAt
            ? -1
            : a.id <= b.id
              ? 1
              : -1,
      );
    return clone(latestAppVersion ?? null);
  }

  async findAllLatests(): Promise<AppVersionEntity[]> {
    this.ensureNotDisposed();
    const latestAppVersions: Record<AppId, AppVersionEntity> = {};
    Object.values(this.appVersions).forEach((appVersion) => {
      const currentLatest = latestAppVersions[appVersion.appId];
      if (
        !currentLatest ||
        currentLatest.createdAt < appVersion.createdAt ||
        (currentLatest.createdAt.getTime() === appVersion.createdAt.getTime() &&
          currentLatest.id < appVersion.id)
      ) {
        latestAppVersions[appVersion.appId] = appVersion;
      }
    });
    return clone(Object.values(latestAppVersions));
  }
}
