import type {
  Collection,
  Document,
  LiteDocumentVersion,
} from "@superego/backend";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import isEmpty from "../../../../utils/isEmpty.js";
import BucketTimelineNode from "./BucketTimelineNode.js";
import DocumentVersionTimelineNode from "./DocumentVersionTimelineNode.js";
import * as cs from "./History.css.js";
import makeTimelineNodes from "./makeTimelineNodes.js";
import RestoreVersionModal from "./RestoreVersionModal.js";

interface Props {
  collection: Collection;
  document: Document;
  documentVersions: LiteDocumentVersion[];
}
export default function History({
  collection,
  document,
  documentVersions,
}: Props) {
  const timelineNodes = makeTimelineNodes(documentVersions);

  const [versionToRestore, setVersionToRestore] =
    useState<LiteDocumentVersion | null>(null);
  const handleRestore = (documentVersion: LiteDocumentVersion) => {
    setVersionToRestore(documentVersion);
  };
  const canRestore = (documentVersion: LiteDocumentVersion) =>
    documentVersion.collectionVersionId === collection.latestVersion.id;

  return (
    <aside className={cs.History.root}>
      <header className={cs.History.header}>
        <FormattedMessage defaultMessage="Versions history" />
      </header>
      {isEmpty(timelineNodes) ? (
        <div className={cs.History.empty}>
          <FormattedMessage defaultMessage="No version history available" />
        </div>
      ) : (
        timelineNodes.map((timelineNode, index) => {
          const timelinePosition =
            index === 0
              ? "first"
              : index === timelineNodes.length - 1
                ? "last"
                : "middle";
          return "documentVersions" in timelineNode ? (
            <BucketTimelineNode
              key={timelineNode.id}
              document={document}
              bucket={timelineNode}
              onRestore={handleRestore}
              canRestore={canRestore}
              timelinePosition={timelinePosition}
            />
          ) : (
            <DocumentVersionTimelineNode
              key={timelineNode.id}
              document={document}
              documentVersion={timelineNode}
              onRestore={handleRestore}
              canRestore={canRestore(timelineNode)}
              timelinePosition={timelinePosition}
            />
          );
        })
      )}
      {versionToRestore ? (
        <RestoreVersionModal
          collection={collection}
          document={document}
          versionToRestore={versionToRestore}
          isOpen={true}
          onClose={() => setVersionToRestore(null)}
        />
      ) : null}
    </aside>
  );
}
