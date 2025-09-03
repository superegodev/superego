import type { ToolResult } from "@superego/backend";

import { FormattedMessage } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { getDocumentVersionQuery } from "../../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import Link from "../../../design-system/Link/Link.js";
import * as cs from "../ConversationMessages.css.js";

interface Props {
  toolResult: ToolResult.CreateDocument & {
    output: { success: true };
  };
}
export default function CreateDocument({ toolResult }: Props) {
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
          className={cs.CreateDocument.root}
        >
          <h5 className={cs.CreateDocument.title}>
            <FormattedMessage
              defaultMessage="{collection} » Document created"
              values={{
                collection: collection
                  ? CollectionUtils.getDisplayName(collection)
                  : collectionId,
              }}
            />
          </h5>
          <dl className={cs.CreateDocument.summaryProperties}>
            {documentVersion.summaryProperties.map(
              ({ name, value, valueComputationError }) => (
                <div key={name} className={cs.CreateDocument.summaryProperty}>
                  <dt className={cs.CreateDocument.summaryPropertyName}>
                    {name}
                  </dt>
                  <dd className={cs.CreateDocument.summaryPropertyValue}>
                    {value ?? valueComputationError.details.message}
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
