import type {
  App,
  AppId,
  AppNotFound,
  Backend,
  CollectionId,
  CollectionNotFound,
  TypescriptCompilationFailed,
  UnexpectedError,
} from "@superego/backend";
import type { AppDefinition } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type AppVersionEntity from "../../entities/AppVersionEntity.js";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeApp from "../../makers/makeApp.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertAppVersionExists from "../../utils/assertAppVersionExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import {
  compileTypescriptModule,
  getAppTypescriptLibs,
} from "../../utils/typescriptModules.js";

export default class AppsCreateNewVersion extends BackendUsecase<
  Backend["apps"]["createNewVersion"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.appId(),
    v.array(structuralSchemas.backend.ids.collectionId()),
    v.strictObject({
      "/main.tsx": structuralSchemas.backend.types.typescriptModule(),
    }),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.app(),
    [
      structuralSchemas.backend.errors.appNotFound(),
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.typescriptCompilationFailed(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: AppId,
    targetCollectionIds: CollectionId[],
    files: AppDefinition["files"],
  ): ResultPromise<
    App,
    | AppNotFound
    | CollectionNotFound
    | TypescriptCompilationFailed
    | UnexpectedError
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

    const targetCollections: AppVersionEntity["targetCollections"] = [];
    const targetCollectionVersions: CollectionVersionEntity[] = [];
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
      targetCollectionVersions.push(latestCollectionVersion);
    }

    const compilationResult = await compileTypescriptModule(
      this.typescriptCompiler,
      files["/main.tsx"],
      "/main.tsx",
      getAppTypescriptLibs(targetCollectionVersions),
    );
    if (!compilationResult.success) {
      return makeUnsuccessfulResult(compilationResult.error);
    }

    const appVersion: AppVersionEntity = {
      id: Id.generate.appVersion(),
      previousVersionId: previousVersion.id,
      appId: app.id,
      targetCollections,
      files: {
        "/main.tsx": files["/main.tsx"],
        "/main.js": compilationResult.data,
      },
      createdAt: new Date(),
    };

    await this.repos.appVersion.insert(appVersion);

    return makeSuccessfulResult(makeApp(app, appVersion));
  }
}
