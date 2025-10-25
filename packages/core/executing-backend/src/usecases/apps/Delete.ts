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
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";

export default class AppsDelete extends Usecase<Backend["apps"]["delete"]> {
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

    await this.repos.appVersion.deleteAllWhereAppIdEq(id);
    await this.repos.app.delete(id);

    return makeSuccessfulResult(null);
  }
}
