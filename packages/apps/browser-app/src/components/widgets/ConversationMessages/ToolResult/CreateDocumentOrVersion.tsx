import { ToolName, type ToolResult } from "@superego/backend";

import { FormattedMessage } from "react-intl";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import ContentSummary from "../../../design-system/ContentSummary/ContentSummary.js";
import Link from "../../../design-system/Link/Link.js";
import Title from "./Title.js";
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
  const { collectionId, documentId } = toolResult.output.data;
  const { document } = toolResult.artifacts!;
  const collection = CollectionUtils.findCollection(collections, collectionId);
  return (
    <Link
      // TODO: link to the version id once we have the view for it.
      to={{ name: RouteName.Document, collectionId, documentId }}
      className={cs.CreateDocumentOrVersion.root}
    >
      <Title>
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
            defaultMessage="{collection} » New document version created"
            values={{
              collection: collection
                ? CollectionUtils.getDisplayName(collection)
                : collectionId,
            }}
          />
        )}
      </Title>
      <ContentSummary contentSummary={document.latestVersion.contentSummary} />
    </Link>
  );
}
