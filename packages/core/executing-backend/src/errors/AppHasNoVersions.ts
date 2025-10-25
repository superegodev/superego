import type { AppId } from "@superego/backend";

export default class AppHasNoVersions extends Error {
  override name = "AppHasNoVersions";
  constructor(public appId: AppId) {
    super(`App ${appId} has no versions`);
  }
}
