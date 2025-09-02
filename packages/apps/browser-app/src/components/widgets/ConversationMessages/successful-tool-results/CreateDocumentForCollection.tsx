import type { ToolResult } from "@superego/backend";
import DataLoader from "../../../../business-logic/backend/DataLoader.jsx";
import { getDocumentVersionQuery } from "../../../../business-logic/backend/hooks.js";
import * as cs from "../ConversationMessages.css.js";

interface Props {
  toolResult: ToolResult.CreateDocumentForCollection & {
    output: { success: true };
  };
}
export default function CreateDocumentForCollection({ toolResult }: Props) {
  const { collectionId, documentId, documentVersionId } =
    toolResult.output.data;
  return (
    <DataLoader
      queries={[
        getDocumentVersionQuery([collectionId, documentId, documentVersionId]),
      ]}
    >
      {(documentVersion) => (
        <dl className={cs.CreateDocumentForCollection.summaryProperties}>
          {documentVersion.summaryProperties.map(
            ({ name, value, valueComputationError }) => (
              <div
                key={name}
                className={cs.CreateDocumentForCollection.summaryProperty}
              >
                <dt
                  className={cs.CreateDocumentForCollection.summaryPropertyName}
                >
                  {name}
                </dt>
                <dd
                  className={
                    cs.CreateDocumentForCollection.summaryPropertyValue
                  }
                >
                  {value ?? valueComputationError.message}
                </dd>
              </div>
            ),
          )}
        </dl>
      )}
    </DataLoader>
  );
}
