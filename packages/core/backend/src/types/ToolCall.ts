import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import * as v from "valibot";
import ToolName from "../enums/ToolName.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import DocumentVersionIdSchema from "../ids/DocumentVersionId.js";

// Inline schema for FileRef (structural only — schema package doesn't export it).
const fileRefSchema = v.object({
  id: v.string(),
  name: v.string(),
  mimeType: v.string(),
});

interface ToolCall<Tool extends ToolName | string = string, Input = any> {
  id: string;
  tool: Tool;
  input: Input;
}

namespace ToolCall {
  export type GetCollectionTypescriptSchema = ToolCall<
    ToolName.GetCollectionTypescriptSchema,
    { collectionId: import("../ids/CollectionId.js").CollectionId }
  >;
  export type CreateDocuments = ToolCall<
    ToolName.CreateDocuments,
    {
      documents: {
        collectionId: import("../ids/CollectionId.js").CollectionId;
        content: any;
        skipDuplicateCheck?: boolean;
      }[];
    }
  >;
  export type CreateNewDocumentVersion = ToolCall<
    ToolName.CreateNewDocumentVersion,
    {
      collectionId: import("../ids/CollectionId.js").CollectionId;
      id: import("../ids/DocumentId.js").DocumentId;
      latestVersionId: import("../ids/DocumentVersionId.js").DocumentVersionId;
      content: any;
    }
  >;
  export type ExecuteTypescriptFunction = ToolCall<
    ToolName.ExecuteTypescriptFunction,
    {
      collectionIds: import("../ids/CollectionId.js").CollectionId[];
      typescriptFunction: string;
    }
  >;
  export type CreateChart = ToolCall<
    ToolName.CreateChart,
    {
      collectionIds: import("../ids/CollectionId.js").CollectionId[];
      getEChartsOption: string;
    }
  >;
  export type CreateGeoJSONMap = ToolCall<
    ToolName.CreateGeoJSONMap,
    {
      collectionIds: import("../ids/CollectionId.js").CollectionId[];
      getGeoJSON: string;
    }
  >;
  export type CreateDocumentsTables = ToolCall<
    ToolName.CreateDocumentsTables,
    {
      collectionIds: import("../ids/CollectionId.js").CollectionId[];
      getDocumentIds: string;
    }
  >;
  export type SearchDocuments = ToolCall<
    ToolName.SearchDocuments,
    {
      searches: {
        collectionId: import("../ids/CollectionId.js").CollectionId | null;
        query: string;
        limit?: number;
      }[];
    }
  >;
  export type SuggestCollectionsDefinitions = ToolCall<
    ToolName.SuggestCollectionsDefinitions,
    {
      collections: {
        settings: {
          name: string;
          icon: string | null;
          description: string | null;
          collectionCategoryId:
            | import("../ids/CollectionCategoryId.js").CollectionCategoryId
            | null;
        };
        schema: import("@superego/schema").Schema;
        exampleDocument: any;
      }[];
    }
  >;
  export type InspectFile = ToolCall<
    ToolName.InspectFile,
    {
      file: import("@superego/schema").FileRef;
      prompt: string;
    }
  >;
  export type WriteTypescriptModule = ToolCall<
    ToolName.WriteTypescriptModule,
    { source: string }
  >;
}

const baseToolCallSchema = {
  id: v.string(),
  tool: v.string(),
};

const getCollectionTypescriptSchemaSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.GetCollectionTypescriptSchema),
  input: v.object({ collectionId: CollectionIdSchema }),
});
const createDocumentsSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.CreateDocuments),
  input: v.object({
    documents: v.array(
      v.object({
        collectionId: CollectionIdSchema,
        content: v.any(),
        skipDuplicateCheck: v.optional(v.boolean()),
      }),
    ),
  }),
});
const createNewDocumentVersionSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.CreateNewDocumentVersion),
  input: v.object({
    collectionId: CollectionIdSchema,
    id: DocumentIdSchema,
    latestVersionId: DocumentVersionIdSchema,
    content: v.any(),
  }),
});
const executeTypescriptFunctionSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.ExecuteTypescriptFunction),
  input: v.object({
    collectionIds: v.array(CollectionIdSchema),
    typescriptFunction: v.string(),
  }),
});
const createChartSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.CreateChart),
  input: v.object({
    collectionIds: v.array(CollectionIdSchema),
    getEChartsOption: v.string(),
  }),
});
const createGeoJSONMapSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.CreateGeoJSONMap),
  input: v.object({
    collectionIds: v.array(CollectionIdSchema),
    getGeoJSON: v.string(),
  }),
});
const createDocumentsTablesSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.CreateDocumentsTables),
  input: v.object({
    collectionIds: v.array(CollectionIdSchema),
    getDocumentIds: v.string(),
  }),
});
const searchDocumentsSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.SearchDocuments),
  input: v.object({
    searches: v.array(
      v.object({
        collectionId: v.nullable(CollectionIdSchema),
        query: v.string(),
        limit: v.optional(v.number()),
      }),
    ),
  }),
});
const suggestCollectionsDefinitionsSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.SuggestCollectionsDefinitions),
  input: v.object({
    collections: v.array(
      v.object({
        settings: v.object({
          name: v.string(),
          icon: v.nullable(v.string()),
          description: v.nullable(v.string()),
          collectionCategoryId: v.nullable(CollectionCategoryIdSchema),
        }),
        schema: schemaValibotSchemas.schema(),
        exampleDocument: v.any(),
      }),
    ),
  }),
});
const inspectFileSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.InspectFile),
  input: v.object({ file: fileRefSchema, prompt: v.string() }),
});
const writeTypescriptModuleSchema = v.object({
  ...baseToolCallSchema,
  tool: v.literal(ToolName.WriteTypescriptModule),
  input: v.object({ source: v.string() }),
});

const ToolCallSchema = v.union([
  getCollectionTypescriptSchemaSchema,
  createDocumentsSchema,
  createNewDocumentVersionSchema,
  executeTypescriptFunctionSchema,
  createChartSchema,
  createGeoJSONMapSchema,
  createDocumentsTablesSchema,
  searchDocumentsSchema,
  suggestCollectionsDefinitionsSchema,
  inspectFileSchema,
  writeTypescriptModuleSchema,
  // Catch-all for unknown tools — preserves runtime tolerance.
  v.object({ ...baseToolCallSchema, input: v.any() }),
]) as v.GenericSchema<ToolCall>;

export default ToolCallSchema;
export type { ToolCall };
