import type { FileRef, Schema } from "@superego/schema";
import type ToolName from "../enums/ToolName.js";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";

interface ToolCall<Tool extends ToolName | string = string, Input = any> {
  id: string;
  tool: Tool;
  input: Input;
}

namespace ToolCall {
  // Factotum
  export type GetCollectionTypescriptSchema = ToolCall<
    ToolName.GetCollectionTypescriptSchema,
    {
      collectionId: CollectionId;
    }
  >;
  export type CreateDocuments = ToolCall<
    ToolName.CreateDocuments,
    {
      documents: {
        collectionId: CollectionId;
        content: any;
        skipDuplicateCheck?: boolean;
      }[];
    }
  >;
  export type CreateNewDocumentVersion = ToolCall<
    ToolName.CreateNewDocumentVersion,
    {
      collectionId: CollectionId;
      id: DocumentId;
      latestVersionId: DocumentVersionId;
      content: any;
    }
  >;
  export type ExecuteTypescriptFunction = ToolCall<
    ToolName.ExecuteTypescriptFunction,
    {
      collectionIds: CollectionId[];
      typescriptFunction: string;
    }
  >;
  export type CreateChart = ToolCall<
    ToolName.CreateChart,
    {
      collectionIds: CollectionId[];
      getEChartsOption: string;
    }
  >;
  export type CreateMap = ToolCall<
    ToolName.CreateMap,
    {
      collectionIds: CollectionId[];
      getGeoJSON: string;
    }
  >;
  export type CreateDocumentsTables = ToolCall<
    ToolName.CreateDocumentsTables,
    {
      collectionIds: CollectionId[];
      getDocumentIds: string;
    }
  >;
  export type SearchDocuments = ToolCall<
    ToolName.SearchDocuments,
    {
      searches: {
        collectionId: CollectionId | null;
        query: string;
        limit?: number;
      }[];
    }
  >;

  // CollectionCreator
  export type SuggestCollectionsDefinitions = ToolCall<
    ToolName.SuggestCollectionsDefinitions,
    {
      collections: {
        settings: {
          name: string;
          icon: string | null;
          description: string | null;
          collectionCategoryId: CollectionCategoryId | null;
        };
        schema: Schema;
        exampleDocument: any;
      }[];
    }
  >;

  // Shared
  export type InspectFile = ToolCall<
    ToolName.InspectFile,
    {
      file: FileRef;
      prompt: string;
    }
  >;

  // Other tools, not used by an assistant
  export type WriteTypescriptModule = ToolCall<
    ToolName.WriteTypescriptModule,
    {
      source: string;
    }
  >;
}

export default ToolCall;
