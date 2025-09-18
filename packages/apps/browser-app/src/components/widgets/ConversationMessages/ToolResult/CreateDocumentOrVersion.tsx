import { ToolName, type ToolResult } from "@superego/backend";

import { FormattedMessage } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { getDocumentVersionQuery } from "../../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import { vars } from "../../../../themes.css.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import ContentSummary from "../../../design-system/ContentSummary/ContentSummary.jsx";
import Link from "../../../design-system/Link/Link.jsx";
import Skeleton from "../../../design-system/Skeleton/Skeleton.jsx";
import * as cs from "./ToolResult.css.js";

interface Props {
  toolResult: (
    | ToolResult.CreateDocument
    | ToolResult.CreateNewDocumentVersion
  ) & {
    output: { success: true };
  };
}
export default function CreateDocumentOrVersion({ toolResult }: Props) {
  const { collections } = useGlobalData();
  const { collectionId, documentId, documentVersionId } =
    toolResult.output.data;
  const collection = CollectionUtils.findCollection(collections, collectionId);
  return (
    <Link
      to={{ name: RouteName.Document, collectionId, documentId }}
      className={cs.CreateDocumentOrVersion.root}
    >
      <h5 className={cs.CreateDocumentOrVersion.title}>
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
      <DataLoader
        queries={[
          getDocumentVersionQuery([
            collectionId,
            documentId,
            documentVersionId,
          ]),
        ]}
        renderLoading={() => (
          <div className={cs.CreateDocumentOrVersion.contentSummarySkeleton}>
            <Skeleton
              variant="list"
              itemCount={5}
              itemHeight={vars.spacing._4}
              itemGap={vars.spacing._2}
            />
          </div>
        )}
      >
        {({ contentSummary }) => (
          <ContentSummary contentSummary={contentSummary} />
        )}
      </DataLoader>
    </Link>
  );
}
