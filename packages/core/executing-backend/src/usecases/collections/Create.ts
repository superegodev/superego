import type {
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionSchemaNotValid,
  CollectionSettings,
  CollectionSettingsNotValid,
  CollectionVersionSettings,
  ContentSummaryGetterNotValid,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
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
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsCreate extends Usecase<
  Backend["collections"]["create"]
> {
  async exec(
    settings: CollectionSettings,
    schema: Schema,
    versionSettings: CollectionVersionSettings,
  ): ResultPromise<
    Collection,
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
    | CollectionSchemaNotValid
    | ContentSummaryGetterNotValid
    | UnexpectedError
  > {
    const settingsValidationResult = v.safeParse(
      v.strictObject({
        name: backedUtilsValibotSchemas.collectionName(),
        icon: v.nullable(backedUtilsValibotSchemas.icon()),
        collectionCategoryId: v.nullable(
          backedUtilsValibotSchemas.id.collectionCategory(),
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
                "The default export of the getter TypescriptModule is not a function",
              path: [{ key: "getter" }],
            },
          ],
        }),
      );
    }

    const now = new Date();
    const collection: CollectionEntity = {
      id: Id.generate.collection(),
      settings: {
        name: settingsValidationResult.output.name,
        icon: settingsValidationResult.output.icon,
        collectionCategoryId:
          settingsValidationResult.output.collectionCategoryId,
        description: settingsValidationResult.output.description,
        assistantInstructions:
          settingsValidationResult.output.assistantInstructions,
      },
      createdAt: now,
    };
    const collectionVersion: CollectionVersionEntity = {
      id: Id.generate.collectionVersion(),
      previousVersionId: null,
      collectionId: collection.id,
      schema: schemaValidationResult.output,
      settings: {
        contentSummaryGetter: versionSettings.contentSummaryGetter,
      },
      migration: null,
      createdAt: now,
    };
    await this.repos.collection.insert(collection);
    await this.repos.collectionVersion.insert(collectionVersion);

    return makeSuccessfulResult(makeCollection(collection, collectionVersion));
  }
}
