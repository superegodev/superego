import {
  type SummaryProperty,
  type SummaryPropertyDefinition,
  ToolName,
  type ToolResult,
} from "@superego/backend";

import { FormattedMessage } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { getDocumentVersionQuery } from "../../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import Link from "../../../design-system/Link/Link.js";
import * as cs from "./ToolResult.css.js";

interface Props {
  toolResult: (
    | ToolResult.CreateDocument
    | ToolResult.CreateNewDocumentVersion
  ) & {
    output: { success: true };
  };
}
export default function SuccessfulCreateDocumentOrCreateNewDocumentVersion({
  toolResult,
}: Props) {
  const { collections } = useGlobalData();
  const { collectionId, documentId, documentVersionId } =
    toolResult.output.data;
  const collection = CollectionUtils.findCollection(collections, collectionId);
  return (
    <Link
      to={{ name: RouteName.Document, collectionId, documentId }}
      className={cs.SuccessfulCreateDocument.root}
    >
      <h5 className={cs.SuccessfulCreateDocument.title}>
        {toolResult.tool === ToolName.CreateDocument ? (
          <FormattedMessage
            defaultMessage="{collection} » Document created"
            values={{
              collection: collection
                ? CollectionUtils.getDisplayName(collection)
                : collectionId,
            }}
          />
        ) : (
          <FormattedMessage
            defaultMessage="{collection} » Document updated"
            values={{
              collection: collection
                ? CollectionUtils.getDisplayName(collection)
                : collectionId,
            }}
          />
        )}
      </h5>
      <dl className={cs.SuccessfulCreateDocument.summaryProperties}>
        <DataLoader
          queries={[
            getDocumentVersionQuery([
              collectionId,
              documentId,
              documentVersionId,
            ]),
          ]}
          renderLoading={() =>
            collection?.latestVersion.settings.summaryProperties.map(
              renderSummaryProperty,
            )
          }
        >
          {({ summaryProperties }) =>
            summaryProperties.map(renderSummaryProperty)
          }
        </DataLoader>
      </dl>
    </Link>
  );
}

function renderSummaryProperty(
  property: SummaryProperty | SummaryPropertyDefinition,
) {
  return (
    <div
      key={property.name}
      className={cs.SuccessfulCreateDocument.summaryProperty}
    >
      <dt className={cs.SuccessfulCreateDocument.summaryPropertyName}>
        {property.name}
      </dt>
      <dd className={cs.SuccessfulCreateDocument.summaryPropertyValue}>
        {"value" in property
          ? (property.value ?? property.valueComputationError.details.message)
          : null}
      </dd>
    </div>
  );
}
