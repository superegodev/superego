import type {
  App,
  AppId,
  AppNotFound,
  AppSettings,
  AppSettingsNotValid,
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
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class AppsUpdateSettings extends Usecase<
  Backend["apps"]["updateSettings"]
> {
  async exec(
    id: AppId,
    settingsPatch: Partial<AppSettings>,
  ): ResultPromise<App, AppNotFound | AppSettingsNotValid | UnexpectedError> {
    const app = await this.repos.app.find(id);

    if (!app) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", { appId: id }),
      );
    }

    const settingsValidationResult = v.safeParse(
      v.partial(
        v.object({
          alwaysCollapsePrimarySidebar: v.boolean(),
        }),
      ),
      settingsPatch,
    );

    if (!settingsValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppSettingsNotValid", {
          appId: id,
          issues: makeValidationIssues(settingsValidationResult.issues),
        }),
      );
    }

    const latestVersion = await this.repos.appVersion.findLatestWhereAppIdEq(
      app.id,
    );
    assertAppVersionExists(app.id, latestVersion);

    const updatedApp: AppEntity = {
      ...app,
      settings: {
        alwaysCollapsePrimarySidebar:
          settingsValidationResult.output.alwaysCollapsePrimarySidebar !==
          undefined
            ? settingsValidationResult.output.alwaysCollapsePrimarySidebar
            : app.settings.alwaysCollapsePrimarySidebar,
      },
    };
    await this.repos.app.replace(updatedApp);

    return makeSuccessfulResult(makeApp(updatedApp, latestVersion));
  }
}
