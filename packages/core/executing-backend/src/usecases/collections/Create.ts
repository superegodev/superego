import type {
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionSchemaNotValid,
  CollectionSettings,
  CollectionSettingsNotValid,
  CollectionSummaryPropertiesNotValid,
  CollectionVersionSettings,
  RpcResultPromise,
} from "@superego/backend";
import {
  type Schema,
  valibotSchemas as schemaValibotSchemas,
} from "@superego/schema";
import {
  valibotSchemas as backedUtilsValibotSchemas,
  Id,
} from "@superego/shared-utils";
import * as v from "valibot";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsCreate extends Usecase<
  Backend["collections"]["create"]
> {
  async exec(
    settings: CollectionSettings,
    schema: Schema,
    versionSettings: CollectionVersionSettings,
  ): RpcResultPromise<
    Collection,
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
    | CollectionSchemaNotValid
    | CollectionSummaryPropertiesNotValid
  > {
    const settingsValidationResult = v.safeParse(
      v.object({
        name: backedUtilsValibotSchemas.collectionName(),
        icon: v.nullable(backedUtilsValibotSchemas.icon()),
      }),
      settings,
    );
    if (!settingsValidationResult.success) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionSettingsNotValid", {
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
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionCategoryNotFound", {
          collectionCategoryId: settings.collectionCategoryId,
        }),
      );
    }

    const schemaValidationResult = v.safeParse(
      schemaValibotSchemas.schema(),
      schema,
    );
    if (!schemaValidationResult.success) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionSchemaNotValid", {
          collectionId: null,
          issues: makeValidationIssues(schemaValidationResult.issues),
        }),
      );
    }

    const nonValidSummaryPropertyIndexes = (
      await Promise.all(
        versionSettings.summaryProperties.map(({ getter }) =>
          this.javascriptSandbox.moduleDefaultExportsFunction(getter),
        ),
      )
    ).reduce<number[]>(
      (indexes, isValid, index) => (isValid ? indexes : [...indexes, index]),
      [],
    );
    if (!isEmpty(nonValidSummaryPropertyIndexes)) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionSummaryPropertiesNotValid", {
          collectionId: null,
          collectionVersionId: null,
          issues: nonValidSummaryPropertyIndexes.map((index) => ({
            // TODO: i18n
            message:
              "The default export of the getter TypescriptModule is not a function",
            path: [{ key: index }, { key: "getter" }],
          })),
        }),
      );
    }

    const now = new Date();
    const collection: CollectionEntity = {
      id: Id.generate.collection(),
      settings: {
        name: settingsValidationResult.output.name,
        icon: settingsValidationResult.output.icon,
        collectionCategoryId: settings.collectionCategoryId,
      },
      createdAt: now,
    };
    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: collection.id,
      schema: schemaValidationResult.output,
      settings: versionSettings,
      migration: null,
      createdAt: now,
    };
    await this.repos.collection.insert(collection);
    await this.repos.collectionVersion.insert(collectionVersion);

    return makeSuccessfulRpcResult(
      makeCollection(collection, collectionVersion),
    );
  }
}
