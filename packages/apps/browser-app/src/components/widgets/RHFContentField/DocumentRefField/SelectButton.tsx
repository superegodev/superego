import type { Collection, CollectionId, DocumentId } from "@superego/backend";
import type { DocumentRef } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { PiArrowSquareOut } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { getDocumentQuery } from "../../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../../utils/DocumentUtils.js";
import Button from "../../../design-system/Button/Button.js";
import ContentSummaryPropertyValue from "../../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import IconLink from "../../../design-system/IconLink/IconLink.js";
import * as cs from "../RHFContentField.css.js";

interface Props {
  onPress: () => void;
  value: DocumentRef | null | undefined;
  collectionsById: Record<string, Collection>;
  isReadOnly: boolean;
}
export default function SelectButton({
  onPress,
  value,
  collectionsById,
  isReadOnly,
}: Props) {
  const intl = useIntl();
  if (!value) {
    return (
      <Button
        onPress={onPress}
        className={cs.DocumentRefField.SelectButton.button}
      >
        <span className={cs.DocumentRefField.SelectButton.placeholder}>
          {isReadOnly ? (
            "null"
          ) : (
            <FormattedMessage defaultMessage="null - click to select a document" />
          )}
        </span>
      </Button>
    );
  }

  const collection = collectionsById[value.collectionId] ?? null;

  if (Id.is.protoCollection(value.collectionId)) {
    return (
      <Button
        onPress={!isReadOnly ? onPress : undefined}
        className={cs.DocumentRefField.SelectButton.button}
      >
        <FormattedMessage
          defaultMessage="{collection} » Example document"
          values={{
            collection: collection
              ? CollectionUtils.getDisplayName(collection)
              : value.collectionId,
          }}
        />
      </Button>
    );
  }

  return (
    <div className={cs.DocumentRefField.SelectButton.wrapper}>
      <Button
        onPress={!isReadOnly ? onPress : undefined}
        className={cs.DocumentRefField.SelectButton.button}
      >
        <DataLoader
          queries={[
            getDocumentQuery([
              value.collectionId as CollectionId,
              value.documentId as DocumentId,
            ]),
          ]}
        >
          {(document) => (
            <FormattedMessage
              defaultMessage="{collection} » {document}"
              values={{
                collection: collection
                  ? CollectionUtils.getDisplayName(collection)
                  : value.collectionId,
                document: (
                  <ContentSummaryPropertyValue
                    value={DocumentUtils.getDisplayName(document)}
                  />
                ),
              }}
            />
          )}
        </DataLoader>
      </Button>
      <IconLink
        variant="invisible"
        label={intl.formatMessage({ defaultMessage: "Open document" })}
        to={{
          name: RouteName.Document,
          collectionId: value.collectionId as CollectionId,
          documentId: value.documentId as DocumentId,
        }}
        className={cs.DocumentRefField.SelectButton.iconLink}
      >
        <PiArrowSquareOut />
      </IconLink>
    </div>
  );
}
