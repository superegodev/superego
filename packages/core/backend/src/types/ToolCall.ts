import type { Schema } from "@superego/schema";
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
  export type CreateDocument = ToolCall<
    ToolName.CreateDocument,
    {
      collectionId: CollectionId;
      content: any;
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
  export type ExecuteJavascriptFunction = ToolCall<
    ToolName.ExecuteJavascriptFunction,
    {
      collectionId: CollectionId;
      javascriptFunction: string;
    }
  >;
  export type RenderChart = ToolCall<
    ToolName.RenderChart,
    {
      collectionId: CollectionId;
      getEchartsOption: string;
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
}

export default ToolCall;
