import type { ToolResult } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.jsx";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.jsx";
import { getDocumentVersionQuery } from "../../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import Link from "../../../design-system/Link/Link.jsx";
import * as cs from "../ConversationMessages.css.js";

interface Props {
  toolResult: ToolResult.CreateDocumentForCollection & {
    output: { success: true };
  };
}
export default function CreateDocumentForCollection({ toolResult }: Props) {
  const { collections } = useGlobalData();
  const { collectionId, documentId, documentVersionId } =
    toolResult.output.data;
  const collection = CollectionUtils.findCollection(collections, collectionId);
  return (
    <DataLoader
      queries={[
        getDocumentVersionQuery([collectionId, documentId, documentVersionId]),
      ]}
    >
      {(documentVersion) => (
        <Link
          to={{ name: RouteName.Document, collectionId, documentId }}
          className={cs.CreateDocumentForCollection.root}
        >
          <h5 className={cs.CreateDocumentForCollection.title}>
            <FormattedMessage
              defaultMessage="{collection} » Document created"
              values={{
                collection: collection
                  ? CollectionUtils.getDisplayName(collection)
                  : collectionId,
              }}
            />
          </h5>
          <dl className={cs.CreateDocumentForCollection.summaryProperties}>
            {documentVersion.summaryProperties.map(
              ({ name, value, valueComputationError }) => (
                <div
                  key={name}
                  className={cs.CreateDocumentForCollection.summaryProperty}
                >
                  <dt
                    className={
                      cs.CreateDocumentForCollection.summaryPropertyName
                    }
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
        </Link>
      )}
    </DataLoader>
  );
}
