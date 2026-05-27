import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  Document,
  ExecutingTypescriptFunctionFailed,
  TypescriptCompilationFailed,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  type AnyTypeDefinition,
  DataType,
  FormatId,
  type Schema,
  codegen,
  utils as schemaUtils,
} from "@superego/schema";
import { makeUnsuccessfulResult } from "@superego/shared-utils";
import LocalInstantTypeDeclaration from "@superego/typescript-sandbox-global-utils/LocalInstant.d.ts?raw";
import { uniq } from "es-toolkit";
import { DateTime } from "luxon";
import * as v from "valibot";
import makeExecutingTypescriptFunctionFailed from "../../makers/makeExecutingTypescriptFunctionFailed.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import DocumentsList from "./List.js";

export default class DocumentsExecuteTypescriptFunction extends BackendUsecase<
  Backend["documents"]["executeTypescriptFunction"]
> {
  argumentsSchema = v.tuple([
    v.array(structuralSchemas.backend.ids.collectionId()),
    v.string(),
  ]);
  resultSchema = structuralSchemas.global.result(v.any(), [
    structuralSchemas.backend.errors.collectionNotFound(),
    structuralSchemas.backend.errors.typescriptCompilationFailed(),
    structuralSchemas.backend.errors.executingTypescriptFunctionFailed(),
    structuralSchemas.backend.errors.unexpectedError(),
  ]);

  async exec(
    collectionIds: CollectionId[],
    typescriptFunction: string,
  ): ResultPromise<
    any,
    | CollectionNotFound
    | TypescriptCompilationFailed
    | ExecutingTypescriptFunctionFailed
    | UnexpectedError
  > {
    const uniqueCollectionIds = uniq(collectionIds);
    const collectionsById = new Map<CollectionId, { schema: Schema }>();

    for (const collectionId of uniqueCollectionIds) {
      const collection = await this.repos.collection.find(collectionId);
      if (!collection) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        );
      }

      const latestVersion =
        await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
          collectionId,
        );
      assertCollectionVersionExists(collectionId, latestVersion);
      collectionsById.set(collectionId, {
        schema: latestVersion.schema,
      });
    }

    const compileResult = await this.typescriptCompiler.compile(
      { path: "/main.ts", source: typescriptFunction },
      [
        ...uniqueCollectionIds.map((collectionId) => ({
          path: `/${collectionId}.ts` as const,
          source: codegen(collectionsById.get(collectionId)!.schema),
        })),
        {
          path: "/LocalInstant.d.ts",
          source: LocalInstantTypeDeclaration,
        },
      ],
    );
    if (!compileResult.success) {
      return compileResult;
    }

    const documentsByCollection: Record<CollectionId, FunctionDocument[]> =
      {} as Record<CollectionId, FunctionDocument[]>;
    const timeZone = DateTime.local().zoneName;
    for (const collectionId of uniqueCollectionIds) {
      const documentsResult = await this.sub(DocumentsList).exec(
        collectionId,
        false,
      );
      if (!documentsResult.success) {
        return documentsResult;
      }

      const { schema } = collectionsById.get(collectionId)!;
      documentsByCollection[collectionId] = documentsResult.data.map(
        (document) => toFunctionDocument(schema, document, timeZone),
      );
    }

    const executionResult = await this.typescriptSandbox.executeSyncFunction(
      typescriptFunction,
      [documentsByCollection],
    );
    return executionResult.success
      ? executionResult
      : makeUnsuccessfulResult(
          makeExecutingTypescriptFunctionFailed(executionResult.error),
        );
  }
}

interface FunctionDocument {
  id: string;
  versionId: string;
  content: unknown;
}

function toFunctionDocument(
  schema: Schema,
  document: Document,
  timeZone: string,
): FunctionDocument {
  return {
    id: document.id,
    versionId: document.latestVersion.id,
    content: toFunctionValue(
      schema,
      document.latestVersion.content,
      schemaUtils.getRootType(schema),
      timeZone,
    ),
  };
}

function toFunctionValue(
  schema: Schema,
  value: unknown,
  typeDefinition: AnyTypeDefinition,
  timeZone: string,
): unknown {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if ("ref" in typeDefinition) {
    return toFunctionValue(
      schema,
      value,
      schemaUtils.getType(schema, typeDefinition),
      timeZone,
    );
  }
  if (typeDefinition.dataType === DataType.Struct) {
    return Object.fromEntries(
      Object.entries(typeDefinition.properties).map(
        ([propertyName, propertyTypeDefinition]) => [
          propertyName,
          toFunctionValue(
            schema,
            (value as Record<string, unknown>)[propertyName],
            propertyTypeDefinition,
            timeZone,
          ),
        ],
      ),
    );
  }
  if (typeDefinition.dataType === DataType.List) {
    return (value as unknown[]).map((item) =>
      toFunctionValue(schema, item, typeDefinition.items, timeZone),
    );
  }
  if (
    typeDefinition.dataType === DataType.String &&
    typeDefinition.format === FormatId.String.Instant
  ) {
    return DateTime.fromISO(value as string)
      .setZone(timeZone)
      .toISO();
  }
  return value;
}
