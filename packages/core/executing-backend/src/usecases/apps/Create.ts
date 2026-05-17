import type {
  App,
  AppDefinition,
  AppId,
  AppNameNotValid,
  AppVersionNotValid,
  Backend,
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
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import validateAppVersionDefinition from "./validateAppVersionDefinition.js";

interface AppsCreateOptions {
  appId?: AppId;
}

export default class AppsCreate extends BackendUsecase<
  Backend["apps"]["create"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.types.appDefinition()]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.app(),
    [
      structuralSchemas.backend.errors.appNameNotValid(),
      structuralSchemas.backend.errors.appVersionNotValid(),
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    {
      type,
      name,
      targetCollections: targetCollectionDefinitions,
      entrypoint,
      files,
    }: AppDefinition,
    options: AppsCreateOptions = {},
  ): ResultPromise<
    App,
    AppNameNotValid | AppVersionNotValid | CollectionNotFound | UnexpectedError
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
    const appVersionValidationIssues = validateAppVersionDefinition(
      entrypoint,
      files,
      targetCollectionDefinitions,
    );
    for (const [
      targetCollectionIndex,
      targetCollection,
    ] of targetCollectionDefinitions.entries()) {
      const collectionId = targetCollection.id;
      const collection = await this.repos.collection.find(collectionId);
      if (!collection) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        );
      }

      const latestCollectionVersion = targetCollection.versionId
        ? await this.repos.collectionVersion.find(targetCollection.versionId)
        : await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
            collectionId,
          );
      if (!latestCollectionVersion) {
        appVersionValidationIssues.push({
          message: `Collection version not found for collection ${collectionId}.`,
          path: [
            { key: "targetCollections" },
            { key: targetCollectionIndex },
            { key: "versionId" },
          ],
        });
        continue;
      }
      if (latestCollectionVersion.collectionId !== collectionId) {
        appVersionValidationIssues.push({
          message: `Collection version ${latestCollectionVersion.id} does not belong to collection ${collectionId}.`,
          path: [
            { key: "targetCollections" },
            { key: targetCollectionIndex },
            { key: "versionId" },
          ],
        });
        continue;
      }
      targetCollections.push({
        id: collectionId,
        versionId: latestCollectionVersion.id,
      });
    }

    if (appVersionValidationIssues.length > 0) {
      return makeUnsuccessfulResult(
        makeResultError("AppVersionNotValid", {
          appId: null,
          appVersionId: null,
          issues: appVersionValidationIssues,
        }),
      );
    }

    const now = new Date();
    const app: AppEntity = {
      id: options.appId ?? Id.generate.app(),
      type: type,
      name: nameValidationResult.output,
      createdAt: now,
    };
    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: null,
      appId: app.id,
      targetCollections: targetCollections,
      entrypoint: entrypoint,
      files: files,
      createdAt: now,
    };

    await this.repos.app.insert(app);
    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
