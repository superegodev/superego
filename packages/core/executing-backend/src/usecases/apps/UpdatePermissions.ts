import type {
  App,
  AppId,
  AppPermissions,
  AppNotFound,
  Backend,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type AppEntity from "../../entities/AppEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AppsUpdatePermissions extends BackendUsecase<
  Backend["apps"]["updatePermissions"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    structuralSchemas.backend.types.appPermissions(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.app(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: AppId,
    permissions: AppPermissions,
  ): ResultPromise<App, AppNotFound | UnexpectedError> {
    const app = await this.repos.app.find(id);

    if (!app) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", { appId: id }),
      );
    }

    const latestVersion = await this.repos.appVersion.findLatestWhereAppIdEq(
      app.id,
    );
    assertAppVersionExists(app.id, latestVersion);

    const updatedApp: AppEntity = {
      ...app,
      permissions,
    };
    await this.repos.app.replace(updatedApp);

    return makeSuccessfulResult(makeApp(updatedApp, latestVersion));
  }
}
