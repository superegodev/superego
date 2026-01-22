import type { CollectionId, ToolResult } from "@superego/backend";
import { groupBy } from "es-toolkit";
import { FormattedMessage } from "react-intl";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import ContentSummary from "../../../design-system/ContentSummary/ContentSummary.js";
import Link from "../../../design-system/Link/Link.js";
import DocumentsTable from "../../DocumentsTable/DocumentsTable.js";
import Title from "./Title.js";
import * as cs from "./ToolResult.css.js";

interface Props {
  toolResult: ToolResult.CreateDocuments & {
    output: { success: true };
    artifacts: NonNullable<ToolResult.CreateDocuments["artifacts"]>;
  };
}
export default function CreateDocuments({ toolResult }: Props) {
  const { collections } = useGlobalData();
  const documentsByCollectionId = groupBy(
    toolResult.artifacts.documents,
    ({ collectionId }) => collectionId,
  );
  const collectionIds = Object.keys(documentsByCollectionId) as CollectionId[];
  return collectionIds.map((collectionId) => {
    const collection = CollectionUtils.findCollection(
      collections,
      collectionId,
    );
    const documents = documentsByCollectionId[collectionId]!;
    return (
      <div key={collectionId}>
        <Title>
          <FormattedMessage
            defaultMessage="{collection} » {documentsCount, plural, one {Document} other {# documents}} created"
            values={{
              collection: collection
                ? CollectionUtils.getDisplayName(collection)
                : collectionId,
              documentsCount: documents.length,
            }}
          />
        </Title>
        {documents.length === 1 ? (
          <Link
            to={{
              name: RouteName.Document,
              collectionId,
              documentId: documents[0]!.id,
              documentVersionId: documents[0]!.latestVersion.id,
              redirectIfLatest: true,
            }}
            className={cs.CreateDocuments.root}
          >
            <ContentSummary
              contentSummary={documents[0]!.latestVersion.contentSummary}
            />
          </Link>
        ) : (
          <DocumentsTable
            collectionId={collectionId}
            collection={collection}
            documents={documents}
          />
        )}
      </div>
    );
  });
}
