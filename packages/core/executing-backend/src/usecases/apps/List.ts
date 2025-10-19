import type { App, AppId, Backend, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import type AppVersionEntity from "../../entities/AppVersionEntity.js";
import makeApp from "../../makers/makeApp.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class AppsList extends Usecase<Backend["apps"]["list"]> {
  async exec(): ResultPromise<App[], UnexpectedError> {
    const apps = await this.repos.app.findAll();
    const latestVersions = await this.repos.appVersion.findAllLatests();
    const latestVersionsByAppId = new Map<AppId, AppVersionEntity>();
    latestVersions.forEach((latestVersion) => {
      latestVersionsByAppId.set(latestVersion.appId, latestVersion);
    });

    return makeSuccessfulResult(
      apps.map((app) => {
        const latestVersion = latestVersionsByAppId.get(app.id);
        assertAppVersionExists(app.id, latestVersion);
        return makeApp(app, latestVersion);
      }),
    );
  }
}
