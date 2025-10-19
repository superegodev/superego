import type {
  App,
  AppNameNotValid,
  AppType,
  Backend,
  CollectionId,
  CollectionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import type AppEntity from "../../entities/AppEntity.js";
import type AppVersionEntity from "../../entities/AppVersionEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class AppsCreate extends Usecase<Backend["apps"]["create"]> {
  async exec(
    type: AppType,
    name: string,
    targetCollectionIds: CollectionId[],
    files: AppVersionEntity["files"],
  ): ResultPromise<
    App,
    AppNameNotValid | CollectionNotFound | UnexpectedError
  > {
    const nameValidationResult = v.safeParse(valibotSchemas.appName(), name);
    if (!nameValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("AppNameNotValid", {
          appId: null,
          issues: makeValidationIssues(nameValidationResult.issues),
        }),
      );
    }

    const targetCollections: AppVersionEntity["targetCollections"] = [];
    for (const collectionId of targetCollectionIds) {
      const collection = await this.repos.collection.find(collectionId);
      if (!collection) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        );
      }

      const latestCollectionVersion =
        await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
          collectionId,
        );
      assertCollectionVersionExists(collectionId, latestCollectionVersion);
      targetCollections.push({
        id: collectionId,
        version: latestCollectionVersion.id,
      });
    }

    const now = new Date();
    const app: AppEntity = {
      id: Id.generate.app(),
      type: type,
      name: nameValidationResult.output,
      createdAt: now,
    };
    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: null,
      appId: app.id,
      targetCollections: targetCollections,
      files: files,
      createdAt: now,
    };

    await this.repos.app.insert(app);
    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
