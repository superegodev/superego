import type {
  Collection,
  CollectionVersionId,
  Document,
  DocumentVersion,
} from "@superego/backend";
import { useState } from "react";
import { TooltipTrigger } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "../../../design-system/Button/Button.js";
import Tooltip from "../../../design-system/Tooltip/Tooltip.js";
import * as cs from "./HistorySidebar.css.js";
import RestoreVersionModalForm from "./RestoreVersionModalForm.js";

interface Props {
  collection: Collection;
  document: Document;
  viewingVersion: DocumentVersion | null;
  latestCollectionVersionId: CollectionVersionId;
  onRestored: () => void;
}

export default function RestoreVersionButton({
  collection,
  document,
  viewingVersion,
  latestCollectionVersionId,
  onRestored,
}: Props) {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show button if viewing the latest version (viewingVersion is null)
  if (viewingVersion === null) {
    return null;
  }

  // Check if the version's schema matches the current collection schema
  const hasSchemaChanged =
    viewingVersion.collectionVersionId !== latestCollectionVersionId;

  const tooltipMessage = intl.formatMessage({
    defaultMessage:
      "Cannot restore: the collection schema has changed since this version was created",
  });

  const buttonElement = (
    <Button
      variant="primary"
      isDisabled={hasSchemaChanged}
      onPress={() => setIsModalOpen(true)}
    >
      <FormattedMessage defaultMessage="Restore this version" />
    </Button>
  );

  return (
    <div className={cs.RestoreVersionButton.root}>
      {hasSchemaChanged ? (
        <TooltipTrigger delay={0}>
          {buttonElement}
          <Tooltip>{tooltipMessage}</Tooltip>
        </TooltipTrigger>
      ) : (
        buttonElement
      )}
      <RestoreVersionModalForm
        collection={collection}
        document={document}
        versionToRestore={viewingVersion}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRestored={onRestored}
      />
    </div>
  );
}
