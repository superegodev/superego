import type { ToolResult } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import ContentSummary from "../../../design-system/ContentSummary/ContentSummary.js";
import Link from "../../../design-system/Link/Link.js";
import Title from "./Title.js";
import * as cs from "./ToolResult.css.js";

interface Props {
  toolResult: ToolResult.CreateNewDocumentVersion & {
    output: { success: true };
  };
}
export default function CreateNewDocumentVersion({ toolResult }: Props) {
  const { collections } = useGlobalData();
  const { document } = toolResult.artifacts!;
  const collection = CollectionUtils.findCollection(
    collections,
    document.collectionId,
  );
  return (
    <div>
      <Title>
        <FormattedMessage
          defaultMessage="{collection} » Created new document version"
          values={{
            collection: collection
              ? CollectionUtils.getDisplayName(collection)
              : document.collectionId,
          }}
        />
      </Title>
      <Link
        to={{
          name: RouteName.Document,
          collectionId: document.collectionId,
          documentId: document.id,
          documentVersionId: document.latestVersion.id,
          redirectIfLatest: true,
        }}
        className={cs.CreateNewDocumentVersion.root}
      >
        <ContentSummary
          contentSummary={document.latestVersion.contentSummary}
        />
      </Link>
    </div>
  );
}
