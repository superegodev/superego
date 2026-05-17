import type {
  App,
  AppId,
  AppVersion,
  AppVersionNotValid,
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
import BackendUsecase from "../../utils/BackendUsecase.js";
import validateAppVersionDefinition from "./validateAppVersionDefinition.js";

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
      structuralSchemas.backend.errors.appVersionNotValid(),
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: AppId,
    targetCollections: AppVersion["targetCollections"],
    entrypoint: AppVersionEntity["entrypoint"],
    files: AppVersionEntity["files"],
  ): ResultPromise<
    App,
    AppNotFound | AppVersionNotValid | CollectionNotFound | UnexpectedError
  > {
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
    const appVersionValidationIssues = validateAppVersionDefinition(
      entrypoint,
      files,
      targetCollections,
    );
    for (const [
      targetCollectionIndex,
      targetCollection,
    ] of targetCollections.entries()) {
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
      if (!collectionVersion) {
        appVersionValidationIssues.push({
          message: `Collection version ${targetCollection.versionId} not found.`,
          path: [
            { key: "targetCollections" },
            { key: targetCollectionIndex },
            { key: "versionId" },
          ],
        });
        continue;
      }
      if (collectionVersion.collectionId !== collectionId) {
        appVersionValidationIssues.push({
          message: `Collection version ${collectionVersion.id} does not belong to collection ${collectionId}.`,
          path: [
            { key: "targetCollections" },
            { key: targetCollectionIndex },
            { key: "versionId" },
          ],
        });
        continue;
      }
      resolvedTargetCollections.push({
        id: collectionId,
        versionId: collectionVersion.id,
      });
    }

    if (appVersionValidationIssues.length > 0) {
      return makeUnsuccessfulResult(
        makeResultError("AppVersionNotValid", {
          appId: app.id,
          appVersionId: null,
          issues: appVersionValidationIssues,
        }),
      );
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
