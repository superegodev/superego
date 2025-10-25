import type {
  App,
  AppId,
  AppNotFound,
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
} from "@superego/shared-utils";
import type AppVersionEntity from "../../entities/AppVersionEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeResultError from "../../makers/makeResultError.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class AppsCreateNewVersion extends Usecase<
  Backend["apps"]["createNewVersion"]
> {
  async exec(
    id: AppId,
    targetCollectionIds: CollectionId[],
    files: AppVersionEntity["files"],
  ): ResultPromise<App, AppNotFound | CollectionNotFound | UnexpectedError> {
    const app = await this.repos.app.find(id);
    if (!app) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", { appId: id }),
      );
    }

    const previousVersion = await this.repos.appVersion.findLatestWhereAppIdEq(
      app.id,
    );
    assertAppVersionExists(app.id, previousVersion);

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
        versionId: latestCollectionVersion.id,
      });
    }

    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: previousVersion.id,
      appId: app.id,
      targetCollections,
      files: files,
      createdAt: new Date(),
    };

    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
