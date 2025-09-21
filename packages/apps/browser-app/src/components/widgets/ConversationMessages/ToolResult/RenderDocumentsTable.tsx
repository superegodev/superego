import type { ToolCall, ToolResult } from "@superego/backend";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import DocumentsTable from "../../DocumentsTable/DocumentsTable.jsx";
import Title from "./Title.jsx";
import * as cs from "./ToolResult.css.js";

interface Props {
  toolCall: ToolCall.RenderDocumentsTable;
  toolResult: ToolResult.RenderDocumentsTable & {
    output: { success: true };
  };
}
export default function RenderDocumentsTable({ toolCall, toolResult }: Props) {
  const { collectionId, title } = toolCall.input;
  const { collections } = useGlobalData();
  const { documents } = toolResult.artifacts!;
  return (
    <div>
      <Title>{title}</Title>
      <DocumentsTable
        collectionId={collectionId}
        collection={CollectionUtils.findCollection(collections, collectionId)}
        documents={documents}
        className={cs.RenderDocumentsTable.table}
      />
    </div>
  );
}
