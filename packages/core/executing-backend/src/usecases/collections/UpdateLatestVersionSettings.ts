import type {
  Backend,
  Collection,
  CollectionId,
  CollectionNotFound,
  CollectionVersionId,
  CollectionVersionIdNotMatching,
  CollectionVersionSettings,
  ContentBlockingKeysGetterNotValid,
  ContentSummaryGetterNotValid,
  DefaultDocumentViewUiOptionsNotValid,
  MakingContentBlockingKeysFailed,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas as sharedUtilsValibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import { isEqual } from "es-toolkit";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeContentBlockingKeys from "../../makers/makeContentBlockingKeys.js";
import makeContentSummaries from "../../makers/makeContentSummaries.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionUpdateLatestVersionSettings extends Usecase<
  Backend["collections"]["updateLatestVersionSettings"]
> {
  async exec(
    id: CollectionId,
    latestVersionId: CollectionVersionId,
    settingsPatch: Partial<CollectionVersionSettings>,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionVersionIdNotMatching
    | ContentBlockingKeysGetterNotValid
    | MakingContentBlockingKeysFailed
    | ContentSummaryGetterNotValid
    | DefaultDocumentViewUiOptionsNotValid
    | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);
    if (latestVersionId !== latestVersion.id) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionVersionIdNotMatching", {
          collectionId: id,
          latestVersionId: latestVersion.id,
          suppliedVersionId: latestVersionId,
        }),
      );
    }

    if (settingsPatch.contentBlockingKeysGetter) {
      const isContentBlockingKeysGetterValid =
        await this.javascriptSandbox.moduleDefaultExportsFunction(
          settingsPatch.contentBlockingKeysGetter,
        );
      if (!isContentBlockingKeysGetterValid) {
        return makeUnsuccessfulResult(
          makeResultError("ContentBlockingKeysGetterNotValid", {
            collectionId: id,
            collectionVersionId: latestVersion.id,
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

    if (settingsPatch.contentSummaryGetter) {
      const isContentSummaryGetterValid =
        await this.javascriptSandbox.moduleDefaultExportsFunction(
          settingsPatch.contentSummaryGetter,
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
    }

    // Validate defaultDocumentViewUiOptions.
    if (settingsPatch.defaultDocumentViewUiOptions !== undefined) {
      if (settingsPatch.defaultDocumentViewUiOptions !== null) {
        const uiOptionsValidationResult = v.safeParse(
          sharedUtilsValibotSchemas.defaultDocumentViewUiOptions(
            latestVersion.schema,
          ),
          settingsPatch.defaultDocumentViewUiOptions,
        );
        if (!uiOptionsValidationResult.success) {
          return makeUnsuccessfulResult(
            makeResultError("DefaultDocumentViewUiOptionsNotValid", {
              collectionId: id,
              collectionVersionId: latestVersion.id,
              issues: makeValidationIssues(
                uiOptionsValidationResult.issues,
              ),
            }),
          );
        }
      }
    }

    const updatedVersion: CollectionVersionEntity = {
      ...latestVersion,
      settings: {
        contentBlockingKeysGetter:
          settingsPatch.contentBlockingKeysGetter !== undefined
            ? settingsPatch.contentBlockingKeysGetter
            : latestVersion.settings.contentBlockingKeysGetter,
        contentSummaryGetter:
          settingsPatch.contentSummaryGetter ??
          latestVersion.settings.contentSummaryGetter,
        defaultDocumentViewUiOptions:
          settingsPatch.defaultDocumentViewUiOptions !== undefined
            ? settingsPatch.defaultDocumentViewUiOptions
            : latestVersion.settings.defaultDocumentViewUiOptions,
      },
    };
    await this.repos.collectionVersion.replace(updatedVersion);

    // Recalculate content blocking keys for all document versions created under
    // this collection version if contentBlockingKeysGetter changed.
    if (
      settingsPatch.contentBlockingKeysGetter !== undefined &&
      !isEqual(
        settingsPatch.contentBlockingKeysGetter,
        latestVersion.settings.contentBlockingKeysGetter,
      )
    ) {
      const documentVersions =
        await this.repos.documentVersion.findAllWhereCollectionVersionIdEq(
          latestVersion.id,
        );
      if (!isEmpty(documentVersions)) {
        for (const documentVersion of documentVersions) {
          if (updatedVersion.settings.contentBlockingKeysGetter === null) {
            // Deduplication disabled: clear blocking keys.
            await this.repos.documentVersion.updateContentBlockingKeys(
              documentVersion.id,
              null,
            );
          } else {
            // Deduplication enabled: recalculate blocking keys.
            const result = await makeContentBlockingKeys(
              this.javascriptSandbox,
              updatedVersion,
              documentVersion.documentId,
              documentVersion.content,
            );
            if (!result.success) {
              return makeUnsuccessfulResult(result.error);
            }
            await this.repos.documentVersion.updateContentBlockingKeys(
              documentVersion.id,
              result.data,
            );
          }
        }
      }
    }

    // Recalculate content summaries for all document versions created under
    // this collection version if contentSummaryGetter changed.
    if (
      settingsPatch.contentSummaryGetter !== undefined &&
      !isEqual(
        settingsPatch.contentSummaryGetter,
        latestVersion.settings.contentSummaryGetter,
      )
    ) {
      const documentVersions =
        await this.repos.documentVersion.findAllWhereCollectionVersionIdEq(
          latestVersion.id,
        );
      if (!isEmpty(documentVersions)) {
        const contentSummaries = await makeContentSummaries(
          this.javascriptSandbox,
          updatedVersion,
          documentVersions,
        );
        for (let i = 0; i < documentVersions.length; i++) {
          await this.repos.documentVersion.updateContentSummary(
            documentVersions[i]!.id,
            contentSummaries[i]!,
          );
        }
      }
    }

    return makeSuccessfulResult(
      makeCollection(collection, updatedVersion, this.getConnector(collection)),
    );
  }
}
