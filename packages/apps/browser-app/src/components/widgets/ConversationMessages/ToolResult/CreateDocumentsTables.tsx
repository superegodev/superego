import type { CollectionId, LiteDocument } from "@superego/backend";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import DocumentsTable from "../../DocumentsTable/DocumentsTable.js";
import * as cs from "./ToolResult.css.js";

interface Props {
  collectionId: CollectionId;
  documents: LiteDocument[];
}
export default function CreateDocumentsTables({
  collectionId,
  documents,
}: Props) {
  const { collections } = useGlobalData();
  return (
    <DocumentsTable
      collectionId={collectionId}
      collection={CollectionUtils.findCollection(collections, collectionId)}
      documents={documents}
      className={cs.CreateDocumentsTables.table}
    />
  );
}
