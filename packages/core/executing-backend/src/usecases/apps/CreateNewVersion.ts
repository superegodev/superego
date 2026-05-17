import type {
  App,
  AppId,
  AppVersion,
  AppNotFound,
  Backend,
  CollectionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type AppVersionEntity from "../../entities/AppVersionEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AppsCreateNewVersion extends BackendUsecase<
  Backend["apps"]["createNewVersion"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    v.array(
      v.strictObject({
        id: structuralSchemas.backend.ids.collectionId(),
        versionId: structuralSchemas.backend.ids.collectionVersionId(),
      }),
    ),
    structuralSchemas.backend.types.appVersionEntrypoint(),
    structuralSchemas.backend.types.appVersionFiles(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.app(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: AppId,
    targetCollections: AppVersion["targetCollections"],
    entrypoint: AppVersionEntity["entrypoint"],
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

    const resolvedTargetCollections: AppVersionEntity["targetCollections"] = [];
    for (const targetCollection of targetCollections) {
      const collectionId = targetCollection.id;
      const collection = await this.repos.collection.find(collectionId);
      if (!collection) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        );
      }

      const collectionVersion = await this.repos.collectionVersion.find(
        targetCollection.versionId,
      );
      assertCollectionVersionExists(collectionId, collectionVersion);
      if (collectionVersion.collectionId !== collectionId) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        );
      }
      resolvedTargetCollections.push({
        id: collectionId,
        versionId: collectionVersion.id,
      });
    }

    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: previousVersion.id,
      appId: app.id,
      targetCollections: resolvedTargetCollections,
      entrypoint,
      files: files,
      createdAt: new Date(),
    };

    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
