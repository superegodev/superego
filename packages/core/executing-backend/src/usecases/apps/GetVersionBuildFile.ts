import type {
  AppId,
  AppNotFound,
  AppVersion,
  AppVersionFile,
  AppVersionFileNotFound,
  AppVersionNotFound,
  Backend,
  UnexpectedError,
} from "@superego/backend";
import { AppVersionFiles } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AppsGetVersionBuildFile extends BackendUsecase<
  Backend["apps"]["getVersionBuildFile"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    structuralSchemas.backend.ids.appVersionId(),
    v.pipe(v.string(), v.regex(/^\/.+$/)) as v.GenericSchema<
      unknown,
      `/${string}`
    >,
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.appVersionFile(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.appVersionNotFound(),
      structuralSchemas.backend.errors.appVersionFileNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    appId: AppId,
    appVersionId: AppVersion["id"],
    path: `/${string}`,
  ): ResultPromise<
    AppVersionFile,
    AppNotFound | AppVersionNotFound | AppVersionFileNotFound | UnexpectedError
  > {
    const app = await this.repos.app.find(appId);
    if (!app) {
      return makeUnsuccessfulResult(makeResultError("AppNotFound", { appId }));
    }

    const appVersion = await this.repos.appVersion.find(appVersionId);
    if (!appVersion || appVersion.appId !== appId) {
      return makeUnsuccessfulResult(
        makeResultError("AppVersionNotFound", { appId, appVersionId }),
      );
    }

    const file = AppVersionFiles.getVersionBuildFile(appVersion.files, path);
    if (!file) {
      return makeUnsuccessfulResult(
        makeResultError("AppVersionFileNotFound", {
          appId,
          appVersionId,
          path,
        }),
      );
    }

    return makeSuccessfulResult(file);
  }
}
