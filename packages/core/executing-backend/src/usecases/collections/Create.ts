import type {
  AppNotFound,
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionId,
  CollectionSchemaNotValid,
  CollectionSettings,
  CollectionSettingsNotValid,
  CollectionVersionSettings,
  ContentFingerprintGetterNotValid,
  ContentSummaryGetterNotValid,
  ReferencedCollectionsNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  type Schema,
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
  allowedUnverifiedCollectionIds?: CollectionId[];
}

export default class CollectionsCreate extends Usecase<
  Backend["collections"]["create"]
> {
  async exec(
    settings: CollectionSettings,
    schema: Schema,
    versionSettings: CollectionVersionSettings,
    options: CollectionsCreateOptions = {},
  ): ResultPromise<
    Collection,
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
    | AppNotFound
    | CollectionSchemaNotValid
    | ReferencedCollectionsNotFound
    | ContentSummaryGetterNotValid
    | ContentFingerprintGetterNotValid
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
    const allowedUnverifiedCollectionIds = new Set(
      options.allowedUnverifiedCollectionIds ?? [],
    );
    const notFoundCollectionIds: string[] = [];
    for (const referencedCollectionId of referencedCollectionIds) {
      if (
        !allowedUnverifiedCollectionIds.has(
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

    if (versionSettings.contentFingerprintGetter !== null) {
      const isContentFingerprintGetterValid =
        await this.javascriptSandbox.moduleDefaultExportsFunction(
          versionSettings.contentFingerprintGetter,
        );
      if (!isContentFingerprintGetterValid) {
        return makeUnsuccessfulResult(
          makeResultError("ContentFingerprintGetterNotValid", {
            collectionId: null,
            collectionVersionId: null,
            issues: [
              {
                message:
                  "The default export of the contentFingerprintGetter TypescriptModule is not a function",
              },
            ],
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
        contentSummaryGetter: versionSettings.contentSummaryGetter,
        contentFingerprintGetter: versionSettings.contentFingerprintGetter,
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
