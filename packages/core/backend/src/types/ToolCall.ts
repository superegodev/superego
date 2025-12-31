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
      collectionId: CollectionId;
      typescriptFunction: string;
    }
  >;
  export type CreateChart = ToolCall<
    ToolName.CreateChart,
    {
      collectionId: CollectionId;
      getEChartsOption: string;
    }
  >;
  export type CreateDocumentsTable = ToolCall<
    ToolName.CreateDocumentsTable,
    {
      collectionId: CollectionId;
      title: string;
      getDocumentIds: string;
    }
  >;
  export type SearchDocuments = ToolCall<
    ToolName.SearchDocuments,
    {
      collectionId: CollectionId | null;
      query: string;
    }
  >;

  // CollectionCreator
  export type SuggestCollectionDefinition = ToolCall<
    ToolName.SuggestCollectionDefinition,
    {
      settings: {
        name: string;
        icon: string | null;
        description: string | null;
        collectionCategoryId: CollectionCategoryId | null;
      };
      schema: Schema;
      tableColumns: { header: string; path: string }[];
      exampleDocument: any;
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
