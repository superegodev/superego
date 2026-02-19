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
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class AppsUpdateName extends Usecase<
  Backend["apps"]["updateName"]
> {
  @validateArgs([valibotSchemas.id.app(), v.string()])
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
