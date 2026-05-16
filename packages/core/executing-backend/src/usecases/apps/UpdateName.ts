import type {
  App,
  AppId,
  AppNameNotValid,
  AppNotFound,
  Backend,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import type AppEntity from "../../entities/AppEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AppsUpdateName extends BackendUsecase<
  Backend["apps"]["updateName"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    v.string(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.app(),
    [
      structuralSchemas.backend.errors.appNameNotValid(),
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: AppId,
    name: string,
  ): ResultPromise<App, AppNotFound | AppNameNotValid | UnexpectedError> {
    const app = await this.repos.app.find(id);

    if (!app) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", { appId: id }),
      );
    }

    const nameValidationResult = v.safeParse(valibotSchemas.appName(), name);
    if (!nameValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppNameNotValid", {
          appId: id,
          issues: makeValidationIssues(nameValidationResult.issues),
        }),
      );
    }

    const latestVersion = await this.repos.appVersion.findLatestWhereAppIdEq(
      app.id,
    );
    assertAppVersionExists(app.id, latestVersion);

    const updatedApp: AppEntity = {
      ...app,
      name: nameValidationResult.output,
    };
    await this.repos.app.replace(updatedApp);

    return makeSuccessfulResult(makeApp(updatedApp, latestVersion));
  }
}
