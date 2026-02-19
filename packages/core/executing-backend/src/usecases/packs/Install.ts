import type {
  App,
  AppId,
  AppNameNotValid,
  AppNotFound,
  AppVersion,
  Backend,
  Collection,
  CollectionCategory,
  CollectionCategoryIconNotValid,
  CollectionCategoryId,
  CollectionCategoryNameNotValid,
  CollectionCategoryNotFound,
  CollectionId,
  CollectionNotFound,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  ConnectorDoesNotSupportUpSyncing,
  ContentBlockingKeysGetterNotValid,
  ContentSummaryGetterNotValid,
  DefaultDocumentViewUiOptionsNotValid,
  Document,
  DocumentContentNotValid,
  DocumentId,
  DuplicateDocumentDetected,
  FilesNotFound,
  MakingContentBlockingKeysFailed,
  Pack,
  PackNotValid,
  ParentCollectionCategoryNotFound,
  ProtoAppId,
  ProtoCollectionCategoryId,
  ProtoCollectionId,
  ProtoDocumentId,
  ReferencedCollectionsNotFound,
  ReferencedDocumentsNotFound,
  UnexpectedError,
  ValidationIssue,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import * as argSchemas from "../../utils/argSchemas.js";
import isEmpty from "../../utils/isEmpty.js";
import {
  extractProtoCollectionIds,
  extractProtoDocumentIds,
  makeProtoAppIdMapping,
  makeProtoCollectionCategoryIdMapping,
  makeProtoCollectionIdMapping,
  makeProtoDocumentIdMapping,
  replaceProtoAppId,
  replaceProtoCollectionCategoryId,
  replaceProtoCollectionIds,
  replaceProtoDocumentIdsAndProtoCollectionIds,
} from "../../utils/ProtoIdUtils.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";
import AppsCreate from "../apps/Create.js";
import CollectionCategoriesCreate from "../collection-categories/Create.js";
import CollectionsCreate from "../collections/Create.js";
import DocumentsCreate from "../documents/Create.js";

export default class PacksInstall extends Usecase<Backend["packs"]["install"]> {
  @validateArgs([argSchemas.pack()])
  async exec(pack: Pack): ResultPromise<
    {
      collectionCategories: CollectionCategory[];
      collections: Collection[];
      apps: App[];
      documents: Document[];
    },
    | PackNotValid
    | CollectionCategoryNameNotValid
    | CollectionCategoryIconNotValid
    | ParentCollectionCategoryNotFound
    | CollectionSettingsNotValid
    | CollectionCategoryNotFound
    | AppNotFound
    | CollectionSchemaNotValid
    | ReferencedCollectionsNotFound
    | ContentBlockingKeysGetterNotValid
    | ContentSummaryGetterNotValid
    | DefaultDocumentViewUiOptionsNotValid
    | AppNameNotValid
    | CollectionNotFound
    | DocumentContentNotValid
    | FilesNotFound
    | ReferencedDocumentsNotFound
    | MakingContentBlockingKeysFailed
    | DuplicateDocumentDetected
    | ConnectorDoesNotSupportUpSyncing
    | UnexpectedError
  > {
    // Step 1: Generate all IDs upfront.
    const collectionCategoryIds = pack.collectionCategories.map(() =>
      Id.generate.collectionCategory(),
    );
    const collectionIds = pack.collections.map(() => Id.generate.collection());
    const appIds = pack.apps.map(() => Id.generate.app());
    const documentIds = pack.documents.map(() => Id.generate.document());

    // Step 2: Create ID mappings.
    const collectionCategoryIdMapping = makeProtoCollectionCategoryIdMapping(
      collectionCategoryIds,
    );
    const collectionIdMapping = makeProtoCollectionIdMapping(collectionIds);
    const appIdMapping = makeProtoAppIdMapping(appIds);
    const documentIdMapping = makeProtoDocumentIdMapping(documentIds);

    // Step 3: Validate proto id references.
    const validationIssues = PacksInstall.validateProtoIdReferences(
      pack,
      collectionCategoryIdMapping,
      collectionIdMapping,
      appIdMapping,
      documentIdMapping,
    );
    if (!isEmpty(validationIssues)) {
      return makeUnsuccessfulResult(
        makeResultError("PackNotValid", { issues: validationIssues }),
      );
    }

    // Step 4: Create collection categories.
    const createdCollectionCategories: CollectionCategory[] = [];
    for (const [index, definition] of pack.collectionCategories.entries()) {
      const result = await this.sub(CollectionCategoriesCreate).exec(
        {
          name: definition.name,
          icon: definition.icon,
          parentId: replaceProtoCollectionCategoryId(
            definition.parentId,
            collectionCategoryIdMapping,
          ),
        },
        {
          collectionCategoryId: collectionCategoryIds[index],
          skipReferenceCheckForCollectionCategoryIds: collectionCategoryIds,
        },
      );
      if (result.error) {
        return makeUnsuccessfulResult(result.error);
      }
      createdCollectionCategories.push(result.data);
    }

    // Step 5: Create collections.
    const createdCollections: Collection[] = [];
    for (const [index, definition] of pack.collections.entries()) {
      const result = await this.sub(CollectionsCreate).exec(
        {
          settings: {
            ...definition.settings,
            collectionCategoryId: replaceProtoCollectionCategoryId(
              definition.settings.collectionCategoryId,
              collectionCategoryIdMapping,
            ),
            defaultCollectionViewAppId: replaceProtoAppId(
              definition.settings.defaultCollectionViewAppId,
              appIdMapping,
            ),
          },
          schema: replaceProtoCollectionIds(
            definition.schema,
            collectionIdMapping,
          ),
          versionSettings: definition.versionSettings,
        },
        {
          collectionId: collectionIds[index],
          skipReferenceCheckForCollectionIds: collectionIds,
          skipReferenceCheckForAppIds: appIds,
        },
      );
      if (result.error) {
        return makeUnsuccessfulResult(result.error);
      }
      createdCollections.push(result.data);
    }

    // Step 6: Create apps.
    const createdApps: App[] = [];
    for (const [index, definition] of pack.apps.entries()) {
      const result = await this.sub(AppsCreate).exec(
        {
          type: definition.type,
          name: definition.name,
          targetCollectionIds: definition.targetCollectionIds.map((id) =>
            Id.is.protoCollection(id) ? collectionIdMapping.get(id)! : id,
          ),
          files: PacksInstall.replaceProtoCollectionIdsInAppFiles(
            definition.files,
            collectionIdMapping,
          ),
        },
        { appId: appIds[index] },
      );
      if (result.error) {
        return makeUnsuccessfulResult(result.error);
      }
      createdApps.push(result.data);
    }

    // Step 7: Create documents.
    const createdDocuments: Document[] = [];
    for (const [index, definition] of pack.documents.entries()) {
      const resolvedCollectionId = Id.is.protoCollection(
        definition.collectionId,
      )
        ? collectionIdMapping.get(definition.collectionId)!
        : definition.collectionId;
      // Note: we need the collection schema for replacing proto ids in the
      // document content.
      const collection = createdCollections.find(
        ({ id }) => id === resolvedCollectionId,
      )!;
      const result = await this.sub(DocumentsCreate).exec(
        {
          collectionId: resolvedCollectionId,
          content: replaceProtoDocumentIdsAndProtoCollectionIds(
            collection.latestVersion.schema,
            definition.content,
            documentIdMapping,
            collectionIdMapping,
          ),
          options: definition.options,
        },
        {
          documentId: documentIds[index],
          skipReferenceCheckForDocumentIds: documentIds,
        },
      );
      if (result.error) {
        return makeUnsuccessfulResult(result.error);
      }
      createdDocuments.push(result.data);
    }

    return makeSuccessfulResult({
      collectionCategories: createdCollectionCategories,
      collections: createdCollections,
      apps: createdApps,
      documents: createdDocuments,
    });
  }

  private static replaceProtoCollectionIdsInAppFiles(
    files: AppVersion["files"],
    collectionIdMapping: Map<ProtoCollectionId, CollectionId>,
  ): AppVersion["files"] {
    const mappingEntries = [...collectionIdMapping.entries()].sort(
      (a, b) => b[0].length - a[0].length,
    );
    if (mappingEntries.length === 0) {
      return files;
    }

    const replaceProtoCollectionIds = (text: string): string => {
      let resolvedText = text;
      for (const [protoCollectionId, collectionId] of mappingEntries) {
        resolvedText = resolvedText.replaceAll(protoCollectionId, collectionId);
      }
      return resolvedText;
    };

    return Object.fromEntries(
      Object.entries(files).map(([filePath, fileContent]) => [
        filePath,
        {
          source: replaceProtoCollectionIds(fileContent.source),
          compiled: replaceProtoCollectionIds(fileContent.compiled),
        },
      ]),
    ) as AppVersion["files"];
  }

  private static validateProtoIdReferences(
    pack: Pack,
    collectionCategoryIdMapping: Map<
      ProtoCollectionCategoryId,
      CollectionCategoryId
    >,
    collectionIdMapping: Map<ProtoCollectionId, CollectionId>,
    appIdMapping: Map<ProtoAppId, AppId>,
    documentIdMapping: Map<ProtoDocumentId, DocumentId>,
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate collection category parent references.
    // Parents must come before children in the array. This prevents circular
    // references.
    for (const [index, definition] of pack.collectionCategories.entries()) {
      if (
        definition.parentId &&
        Id.is.protoCollectionCategory(definition.parentId)
      ) {
        const targetIndex = Id.extractIndex.protoCollectionCategory(
          definition.parentId,
        );
        if (targetIndex === null || targetIndex >= index) {
          issues.push({
            message: `Collection category at index ${index} references parent proto ID ${definition.parentId} which must come before it in the array`,
            path: [
              { key: "collectionCategories" },
              { key: index },
              { key: "parentId" },
            ],
          });
        }
      }
    }

    // Validate collection references.
    for (const [index, definition] of pack.collections.entries()) {
      // Check collectionCategoryId.
      if (
        definition.settings.collectionCategoryId &&
        Id.is.protoCollectionCategory(
          definition.settings.collectionCategoryId,
        ) &&
        !collectionCategoryIdMapping.has(
          definition.settings.collectionCategoryId,
        )
      ) {
        issues.push({
          message: `Collection at index ${index} references unknown proto collection category: ${definition.settings.collectionCategoryId}`,
          path: [
            { key: "collections" },
            { key: index },
            { key: "settings" },
            { key: "collectionCategoryId" },
          ],
        });
      }

      // Check defaultCollectionViewAppId.
      if (
        definition.settings.defaultCollectionViewAppId &&
        Id.is.protoApp(definition.settings.defaultCollectionViewAppId) &&
        !appIdMapping.has(definition.settings.defaultCollectionViewAppId)
      ) {
        issues.push({
          message: `Collection at index ${index} references unknown proto app: ${definition.settings.defaultCollectionViewAppId}`,
          path: [
            { key: "collections" },
            { key: index },
            { key: "settings" },
            { key: "defaultCollectionViewAppId" },
          ],
        });
      }

      // Check schema references to collections
      const protoCollectionRefs = extractProtoCollectionIds(definition.schema);
      const unknownProtoCollectionRefs =
        protoCollectionRefs.difference(collectionIdMapping);
      for (const protoRef of unknownProtoCollectionRefs) {
        issues.push({
          message: `Collection at index ${index} schema references unknown proto collection: ${protoRef}`,
          path: [{ key: "collections" }, { key: index }, { key: "schema" }],
        });
      }
    }

    // Validate app references.
    for (const [index, definition] of pack.apps.entries()) {
      for (const [
        targetIndex,
        collectionId,
      ] of definition.targetCollectionIds.entries()) {
        if (
          Id.is.protoCollection(collectionId) &&
          !collectionIdMapping.has(collectionId)
        ) {
          issues.push({
            message: `App at index ${index} references unknown proto collection: ${collectionId}`,
            path: [
              { key: "apps" },
              { key: index },
              { key: "targetCollectionIds" },
              { key: targetIndex },
            ],
          });
        }
      }
    }

    // Validate document references.
    for (const [index, definition] of pack.documents.entries()) {
      if (
        Id.is.protoCollection(definition.collectionId) &&
        !collectionIdMapping.has(definition.collectionId)
      ) {
        issues.push({
          message: `Document at index ${index} references unknown proto collection: ${definition.collectionId}`,
          path: [{ key: "documents" }, { key: index }, { key: "collectionId" }],
        });
      }

      // Validate proto document references in content. Note: to get the refs,
      // we need to get the collection schema first. We can only validate
      // documents that reference collections within this pack (proto IDs).
      if (Id.is.protoCollection(definition.collectionId)) {
        const collectionIndex = Id.extractIndex.protoCollection(
          definition.collectionId,
        );
        const collection =
          collectionIndex !== null
            ? pack.collections[collectionIndex]
            : undefined;
        if (collection) {
          const protoDocRefs = extractProtoDocumentIds(
            collection.schema,
            definition.content,
          );
          for (const protoRef of protoDocRefs) {
            if (!documentIdMapping.has(protoRef)) {
              issues.push({
                message: `Document at index ${index} content references unknown proto document: ${protoRef}`,
                path: [
                  { key: "documents" },
                  { key: index },
                  { key: "content" },
                ],
              });
            }
          }
        }
      }
    }

    return issues;
  }
}
