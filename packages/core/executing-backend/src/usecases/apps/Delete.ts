import type {
  AppId,
  AppNotFound,
  Backend,
  CommandConfirmationNotValid,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import {
  appNotFound,
  commandConfirmationNotValid,
  unexpectedError,
} from "../../validation/errors.js";
import { appId } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class AppsDelete extends BackendUsecase<
  Backend["apps"]["delete"]
> {
  argumentsSchema = v.tuple([appId(), v.string()]);
  resultSchema = makeResultSchema(v.null(), [
    appNotFound(),
    commandConfirmationNotValid(),
    unexpectedError(),
  ]);

  async exec(
    id: AppId,
    commandConfirmation: string,
  ): ResultPromise<
    null,
    AppNotFound | CommandConfirmationNotValid | UnexpectedError
  > {
    if (commandConfirmation !== "delete") {
      return makeUnsuccessfulResult(
        makeResultError("CommandConfirmationNotValid", {
          suppliedCommandConfirmation: commandConfirmation,
          requiredCommandConfirmation: "delete",
        }),
      );
    }

    const app = await this.repos.app.find(id);
    if (!app) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", { appId: id }),
      );
    }

    const collections = await this.repos.collection.findAll();
    for (const collection of collections) {
      if (collection.settings.defaultCollectionViewAppId === id) {
        await this.repos.collection.replace({
          ...collection,
          settings: {
            ...collection.settings,
            defaultCollectionViewAppId: null,
          },
        });
      }
    }
    await this.repos.appVersion.deleteAllWhereAppIdEq(id);
    await this.repos.app.delete(id);

    return makeSuccessfulResult(null);
  }
}
