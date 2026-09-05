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
import { isEqual } from "es-toolkit";
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
    v.array(structuralSchemas.backend.ids.collectionId()),
    v.strictObject({
      "/main.tsx": structuralSchemas.backend.types.typescriptModule(),
    }),
    v.optional(v.string()),
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
    targetCollectionIds: CollectionId[],
    files: AppVersionEntity["files"],
    spec?: string,
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

    // Updating intent alone must not rebind unchanged code to newer schemas.
    const isSpecOnlyUpdate =
      spec !== undefined &&
      spec !== previousVersion.spec &&
      isEqual(files, previousVersion.files) &&
      isEqual(
        targetCollectionIds,
        previousVersion.targetCollections.map(({ id }) => id),
      );

    const targetCollections: AppVersionEntity["targetCollections"] = [];
    for (const [index, collectionId] of targetCollectionIds.entries()) {
      const collection = await this.repos.collection.find(collectionId);
      if (!collection) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        );
      }

      if (isSpecOnlyUpdate) {
        targetCollections.push(previousVersion.targetCollections[index]!);
        continue;
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
      spec: spec ?? previousVersion.spec,
      files: files,
      createdAt: new Date(),
    };

    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
