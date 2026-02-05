import type {
  App,
  AppId,
  AppNameNotValid,
  AppNotFound,
  Backend,
  Collection,
  CollectionCategoryNotFound,
  CollectionId,
  CollectionNotFound,
  CollectionSchemaNotValid,
  CollectionSettingsNotValid,
  ConnectorDoesNotSupportUpSyncing,
  ContentBlockingKeysGetterNotValid,
  ContentSummaryGetterNotValid,
  Document,
  DocumentContentNotValid,
  DocumentId,
  DuplicateDocumentDetected,
  FilesNotFound,
  MakingContentBlockingKeysFailed,
  Pack,
  PackInstallationResult,
  PackNotValid,
  ProtoAppId,
  ProtoCollectionId,
  ProtoDocumentId,
  ReferencedCollectionsNotFound,
  ReferencedDocumentsNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { utils as schemaUtils } from "@superego/schema";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import AppsCreate from "../apps/Create.js";
import CollectionsCreate from "../collections/Create.js";
import CollectionsUpdateSettings from "../collections/UpdateSettings.js";
import DocumentsCreate from "../documents/Create.js";

export default class BazaarInstallPack extends Usecase<
  Backend["bazaar"]["installPack"]
> {
  async exec(
    pack: Pack,
  ): ResultPromise<
    PackInstallationResult,
    | PackNotValid
    | CollectionSettingsNotValid
    | CollectionSchemaNotValid
    | AppNameNotValid
    | AppNotFound
    | CollectionNotFound
    | CollectionCategoryNotFound
    | ContentBlockingKeysGetterNotValid
    | ContentSummaryGetterNotValid
    | ReferencedCollectionsNotFound
    | ConnectorDoesNotSupportUpSyncing
    | DocumentContentNotValid
    | FilesNotFound
    | ReferencedDocumentsNotFound
    | MakingContentBlockingKeysFailed
    | DuplicateDocumentDetected
    | UnexpectedError
  > {
    // Validate pack structure
    const packValidationIssues = this.validatePack(pack);
    if (packValidationIssues.length > 0) {
      return makeUnsuccessfulResult(
        makeResultError("PackNotValid", { issues: packValidationIssues }),
      );
    }

    // Generate real IDs upfront
    const collectionIdMapping = new Map<ProtoCollectionId, CollectionId>();
    for (const collectionDef of pack.collections) {
      collectionIdMapping.set(collectionDef.protoId, Id.generate.collection());
    }

    const appIdMapping = new Map<ProtoAppId, AppId>();
    for (const appDef of pack.apps) {
      appIdMapping.set(appDef.protoId, Id.generate.app());
    }

    const documentIdMapping = new Map<ProtoDocumentId, DocumentId>();
    for (const documentDef of pack.documents) {
      documentIdMapping.set(documentDef.protoId, Id.generate.document());
    }

    // Phase 1: Create all collections with defaultCollectionViewAppId: null
    const collectionsCreate = this.sub(CollectionsCreate);
    const createdCollections: Collection[] = [];
    const collectionIds = [...collectionIdMapping.values()];

    for (const collectionDef of pack.collections) {
      const collectionId = collectionIdMapping.get(collectionDef.protoId)!;

      // Resolve proto collection IDs in schema
      const protoCollectionIds = schemaUtils.extractProtoCollectionIds(
        collectionDef.schema,
      );
      const notFoundProtoCollectionIds = protoCollectionIds.filter(
        (id) => !collectionIdMapping.has(id),
      );
      if (notFoundProtoCollectionIds.length > 0) {
        return makeUnsuccessfulResult(
          makeResultError("ReferencedCollectionsNotFound", {
            collectionId: null,
            notFoundCollectionIds: notFoundProtoCollectionIds,
          }),
        );
      }

      const resolvedSchema = schemaUtils.replaceProtoCollectionIds(
        collectionDef.schema,
        collectionIdMapping,
      );

      const createResult = await collectionsCreate.exec(
        {
          name: collectionDef.settings.name,
          icon: collectionDef.settings.icon,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: collectionDef.settings.description,
          assistantInstructions: collectionDef.settings.assistantInstructions,
        },
        resolvedSchema,
        collectionDef.versionSettings,
        {
          collectionId,
          allowedUnverifiedCollectionIds: collectionIds,
        },
      );

      if (createResult.error) {
        return makeUnsuccessfulResult(createResult.error);
      }

      createdCollections.push(createResult.data);
    }

    // Phase 2: Create all apps with real collection IDs
    const appsCreate = this.sub(AppsCreate);
    const createdApps: App[] = [];

    for (const appDef of pack.apps) {
      const targetCollectionIds = appDef.targetCollectionProtoIds.map(
        (protoId) => collectionIdMapping.get(protoId)!,
      );

      const createResult = await appsCreate.exec(
        appDef.type,
        appDef.name,
        targetCollectionIds,
        appDef.files,
      );

      if (createResult.error) {
        return makeUnsuccessfulResult(createResult.error);
      }

      // Update the app ID mapping with the actual created app ID
      appIdMapping.set(appDef.protoId, createResult.data.id);
      createdApps.push(createResult.data);
    }

    // Phase 3: Update collections that need a defaultCollectionViewAppId
    const collectionsUpdateSettings = this.sub(CollectionsUpdateSettings);

    for (const collectionDef of pack.collections) {
      if (collectionDef.settings.defaultCollectionViewAppProtoId) {
        const collectionId = collectionIdMapping.get(collectionDef.protoId)!;
        const appId = appIdMapping.get(
          collectionDef.settings.defaultCollectionViewAppProtoId,
        );

        if (!appId) {
          // This should have been caught in validation, but just in case
          return makeUnsuccessfulResult(
            makeResultError("PackNotValid", {
              issues: [
                {
                  message: `Collection "${collectionDef.settings.name}" references non-existent app proto ID "${collectionDef.settings.defaultCollectionViewAppProtoId}"`,
                },
              ],
            }),
          );
        }

        const updateResult = await collectionsUpdateSettings.exec(
          collectionId,
          {
            defaultCollectionViewAppId: appId,
          },
        );

        if (updateResult.error) {
          return makeUnsuccessfulResult(updateResult.error);
        }

        // Update the collection in our list
        const idx = createdCollections.findIndex((c) => c.id === collectionId);
        if (idx !== -1) {
          createdCollections[idx] = updateResult.data;
        }
      }
    }

    // Phase 4: Create all documents
    const documentsCreate = this.sub(DocumentsCreate);
    const createdDocuments: Document[] = [];
    const documentIds = [...documentIdMapping.values()];

    for (const documentDef of pack.documents) {
      const collectionId = collectionIdMapping.get(documentDef.collectionProtoId)!;
      const documentId = documentIdMapping.get(documentDef.protoId)!;

      // Find the collection to get its schema
      const collection = createdCollections.find((c) => c.id === collectionId);
      if (!collection) {
        return makeUnsuccessfulResult(
          makeResultError("PackNotValid", {
            issues: [
              {
                message: `Document references collection proto ID "${documentDef.collectionProtoId}" which was not found`,
              },
            ],
          }),
        );
      }

      // Resolve proto document IDs in content
      const protoDocumentIds = schemaUtils.extractProtoDocumentIds(
        collection.latestVersion.schema,
        documentDef.content,
      );
      const notFoundProtoDocumentIds = protoDocumentIds.filter(
        (id) => !documentIdMapping.has(id),
      );
      if (notFoundProtoDocumentIds.length > 0) {
        return makeUnsuccessfulResult(
          makeResultError("ReferencedDocumentsNotFound", {
            collectionId,
            documentId: null,
            notFoundDocumentRefs: notFoundProtoDocumentIds.map((protoId) => ({
              collectionId,
              documentId: protoId,
            })),
          }),
        );
      }

      // Replace both proto document IDs and proto collection IDs in content
      const contentWithResolvedDocs = schemaUtils.replaceProtoDocumentIds(
        collection.latestVersion.schema,
        documentDef.content,
        documentIdMapping,
      );
      const resolvedContent = this.replaceProtoCollectionIdsInContent(
        collection.latestVersion.schema,
        contentWithResolvedDocs,
        collectionIdMapping,
      );

      const createResult = await documentsCreate.exec(
        collectionId,
        resolvedContent,
        {
          skipDuplicateCheck: true,
          documentId,
          allowedUnverifiedDocumentIds: documentIds,
        },
      );

      if (createResult.error) {
        return makeUnsuccessfulResult(createResult.error);
      }

      createdDocuments.push(createResult.data);
    }

    return makeSuccessfulResult({
      collections: createdCollections,
      apps: createdApps,
      documents: createdDocuments,
    });
  }

  private validatePack(pack: Pack): { message: string }[] {
    const issues: { message: string }[] = [];

    // Check pack has a valid id
    if (!Id.is.pack(pack.id)) {
      issues.push({
        message:
          "Pack ID must be in reverse domain name format (e.g., Pack_com.example.mypack)",
      });
    }

    // Check pack has a name
    if (!pack.info.name || pack.info.name.trim() === "") {
      issues.push({ message: "Pack name is required" });
    }

    // Check for duplicate proto IDs
    const collectionProtoIds = new Set<string>();
    for (const collectionDef of pack.collections) {
      if (collectionProtoIds.has(collectionDef.protoId)) {
        issues.push({
          message: `Duplicate collection proto ID: ${collectionDef.protoId}`,
        });
      }
      collectionProtoIds.add(collectionDef.protoId);
    }

    const appProtoIds = new Set<string>();
    for (const appDef of pack.apps) {
      if (appProtoIds.has(appDef.protoId)) {
        issues.push({ message: `Duplicate app proto ID: ${appDef.protoId}` });
      }
      appProtoIds.add(appDef.protoId);
    }

    const documentProtoIds = new Set<string>();
    for (const documentDef of pack.documents) {
      if (documentProtoIds.has(documentDef.protoId)) {
        issues.push({
          message: `Duplicate document proto ID: ${documentDef.protoId}`,
        });
      }
      documentProtoIds.add(documentDef.protoId);
    }

    // Validate app targetCollectionProtoIds reference valid collections
    for (const appDef of pack.apps) {
      for (const protoId of appDef.targetCollectionProtoIds) {
        if (!collectionProtoIds.has(protoId)) {
          issues.push({
            message: `App "${appDef.name}" references non-existent collection proto ID: ${protoId}`,
          });
        }
      }
    }

    // Validate collection defaultCollectionViewAppProtoIds reference valid apps
    for (const collectionDef of pack.collections) {
      if (collectionDef.settings.defaultCollectionViewAppProtoId) {
        if (
          !appProtoIds.has(
            collectionDef.settings.defaultCollectionViewAppProtoId,
          )
        ) {
          issues.push({
            message: `Collection "${collectionDef.settings.name}" references non-existent app proto ID: ${collectionDef.settings.defaultCollectionViewAppProtoId}`,
          });
        }
      }
    }

    // Validate document collectionProtoIds reference valid collections
    for (const documentDef of pack.documents) {
      if (!collectionProtoIds.has(documentDef.collectionProtoId)) {
        issues.push({
          message: `Document with proto ID "${documentDef.protoId}" references non-existent collection proto ID: ${documentDef.collectionProtoId}`,
        });
      }
    }

    return issues;
  }

  /**
   * Replaces proto collection IDs inside DocumentRef values in document content.
   * This is needed because DocumentRef values have both collectionId and documentId,
   * and the collectionId may be a proto collection ID that needs to be resolved.
   */
  private replaceProtoCollectionIdsInContent(
    schema: any,
    content: any,
    collectionIdMapping: Map<ProtoCollectionId, CollectionId>,
  ): any {
    return this._replaceInContent(
      schema,
      content,
      schema.types[schema.rootType],
      collectionIdMapping,
    );
  }

  private _replaceInContent(
    schema: any,
    value: any,
    typeDefinition: any,
    collectionIdMapping: Map<ProtoCollectionId, CollectionId>,
  ): any {
    if (value === null || value === undefined) {
      return value;
    }

    if ("ref" in typeDefinition) {
      return this._replaceInContent(
        schema,
        value,
        schema.types[typeDefinition.ref],
        collectionIdMapping,
      );
    }

    if (typeDefinition.dataType === "DocumentRef") {
      if (typeof value === "object" && typeof value.collectionId === "string") {
        const actualCollectionId = collectionIdMapping.get(
          value.collectionId as ProtoCollectionId,
        );
        if (actualCollectionId) {
          return { ...value, collectionId: actualCollectionId };
        }
      }
      return value;
    }

    if (typeDefinition.dataType === "Struct") {
      const result: Record<string, any> = {};
      for (const [propertyName, propertyTypeDefinition] of Object.entries(
        typeDefinition.properties,
      )) {
        result[propertyName] = this._replaceInContent(
          schema,
          value[propertyName],
          propertyTypeDefinition,
          collectionIdMapping,
        );
      }
      return result;
    }

    if (typeDefinition.dataType === "List") {
      if (Array.isArray(value)) {
        return value.map((item) =>
          this._replaceInContent(
            schema,
            item,
            typeDefinition.items,
            collectionIdMapping,
          ),
        );
      }
      return value;
    }

    return value;
  }
}
