import type {
  AppId,
  AppNotFound,
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionDefinition,
  CollectionId,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  ContentBlockingKeysGetterNotValid,
  ContentSummaryGetterNotValid,
  DefaultDocumentViewUiOptionsNotValid,
  ReferencedCollectionsNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  utils as schemaUtils,
  valibotSchemas as schemaValibotSchemas,
} from "@superego/schema";
import {
  valibotSchemas as backedUtilsValibotSchemas,
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

interface CollectionsCreateOptions {
  dryRun?: boolean;
  collectionId?: CollectionId;
  skipReferenceCheckForCollectionIds?: CollectionId[];
  skipReferenceCheckForAppIds?: AppId[];
}

export default class CollectionsCreate extends Usecase<
  Backend["collections"]["create"]
> {
  async exec(
    { settings, schema, versionSettings }: CollectionDefinition,
    options: CollectionsCreateOptions = {},
  ): ResultPromise<
    Collection,
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
    | AppNotFound
    | CollectionSchemaNotValid
    | ReferencedCollectionsNotFound
    | ContentBlockingKeysGetterNotValid
    | ContentSummaryGetterNotValid
    | DefaultDocumentViewUiOptionsNotValid
    | UnexpectedError
  > {
    const settingsValidationResult = v.safeParse(
      v.strictObject({
        name: backedUtilsValibotSchemas.collectionName(),
        icon: v.nullable(backedUtilsValibotSchemas.icon()),
        collectionCategoryId: v.nullable(
          backedUtilsValibotSchemas.id.collectionCategory(),
        ),
        defaultCollectionViewAppId: v.nullable(
          backedUtilsValibotSchemas.id.app(),
        ),
        description: v.nullable(v.string()),
        assistantInstructions: v.nullable(v.string()),
      }),
      settings,
    );
    if (!settingsValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionSettingsNotValid", {
          collectionId: null,
          issues: makeValidationIssues(settingsValidationResult.issues),
        }),
      );
    }

    if (
      settings.collectionCategoryId &&
      !(await this.repos.collectionCategory.exists(
        settings.collectionCategoryId,
      ))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionCategoryNotFound", {
          collectionCategoryId: settings.collectionCategoryId,
        }),
      );
    }

    if (
      settings.defaultCollectionViewAppId &&
      !options.skipReferenceCheckForAppIds?.includes(
        settings.defaultCollectionViewAppId,
      ) &&
      !(await this.repos.app.exists(settings.defaultCollectionViewAppId))
    ) {
      return makeUnsuccessfulResult(
        makeResultError("AppNotFound", {
          appId: settings.defaultCollectionViewAppId,
        }),
      );
    }

    // Use provided collectionId or generate one upfront to resolve "self"
    // references.
    const collectionId = options.collectionId ?? Id.generate.collection();

    const schemaValidationResult = v.safeParse(
      schemaValibotSchemas.schema(),
      schema,
    );
    if (!schemaValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionSchemaNotValid", {
          collectionId: null,
          issues: makeValidationIssues(schemaValidationResult.issues),
        }),
      );
    }

    const resolvedSchema = schemaUtils.replaceSelfCollectionId(
      schemaValidationResult.output,
      collectionId,
    );

    const referencedCollectionIds =
      schemaUtils.extractReferencedCollectionIds(resolvedSchema);
    const notFoundCollectionIds: string[] = [];
    for (const referencedCollectionId of referencedCollectionIds) {
      if (
        !options.skipReferenceCheckForCollectionIds?.includes(
          referencedCollectionId as CollectionId,
        ) &&
        !(await this.repos.collection.exists(
          referencedCollectionId as CollectionId,
        ))
      ) {
        notFoundCollectionIds.push(referencedCollectionId);
      }
    }
    if (!isEmpty(notFoundCollectionIds)) {
      return makeUnsuccessfulResult(
        makeResultError("ReferencedCollectionsNotFound", {
          collectionId: null,
          notFoundCollectionIds,
        }),
      );
    }

    if (versionSettings.contentBlockingKeysGetter !== null) {
      const isContentBlockingKeysGetterValid =
        await this.javascriptSandbox.moduleDefaultExportsFunction(
          versionSettings.contentBlockingKeysGetter,
        );
      if (!isContentBlockingKeysGetterValid) {
        return makeUnsuccessfulResult(
          makeResultError("ContentBlockingKeysGetterNotValid", {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message:
                  "The default export of the contentBlockingKeysGetter TypescriptModule is not a function",
              },
            ],
          }),
        );
      }
    }

    const isContentSummaryGetterValid =
      await this.javascriptSandbox.moduleDefaultExportsFunction(
        versionSettings.contentSummaryGetter,
      );
    if (!isContentSummaryGetterValid) {
      return makeUnsuccessfulResult(
        makeResultError("ContentSummaryGetterNotValid", {
          collectionId: null,
          collectionVersionId: null,
          issues: [
            {
              message:
                "The default export of the contentSummaryGetter TypescriptModule is not a function",
            },
          ],
        }),
      );
    }

    // Validate defaultDocumentViewUiOptions.
    if (versionSettings.defaultDocumentViewUiOptions !== null) {
      const uiOptionsValidationResult = v.safeParse(
        backedUtilsValibotSchemas.defaultDocumentViewUiOptions(resolvedSchema),
        versionSettings.defaultDocumentViewUiOptions,
      );
      if (!uiOptionsValidationResult.success) {
        return makeUnsuccessfulResult(
          makeResultError("DefaultDocumentViewUiOptionsNotValid", {
            collectionId: null,
            collectionVersionId: null,
            issues: makeValidationIssues(uiOptionsValidationResult.issues),
          }),
        );
      }
    }

    const now = new Date();
    const collection: CollectionEntity = {
      id: collectionId,
      settings: {
        name: settingsValidationResult.output.name,
        icon: settingsValidationResult.output.icon,
        collectionCategoryId:
          settingsValidationResult.output.collectionCategoryId,
        defaultCollectionViewAppId:
          settingsValidationResult.output.defaultCollectionViewAppId,
        description: settingsValidationResult.output.description,
        assistantInstructions:
          settingsValidationResult.output.assistantInstructions,
      },
      remote: null,
      createdAt: now,
    };
    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: collectionId,
      schema: resolvedSchema,
      settings: {
        contentBlockingKeysGetter: versionSettings.contentBlockingKeysGetter,
        contentSummaryGetter: versionSettings.contentSummaryGetter,
        defaultDocumentViewUiOptions:
          versionSettings.defaultDocumentViewUiOptions,
      },
      migration: null,
      remoteConverters: null,
      createdAt: now,
    };
    if (!options.dryRun) {
      await this.repos.collection.insert(collection);
      await this.repos.collectionVersion.insert(collectionVersion);
    }

    return makeSuccessfulResult(
      makeCollection(collection, collectionVersion, null),
    );
  }
}
