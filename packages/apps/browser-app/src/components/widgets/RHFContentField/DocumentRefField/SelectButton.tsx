import type { Collection, CollectionId, DocumentId } from "@superego/backend";
import { type DocumentRef, utils } from "@superego/schema";
import { FormattedMessage } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { getDocumentQuery } from "../../../../business-logic/backend/hooks.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../../utils/DocumentUtils.js";
import Button from "../../../design-system/Button/Button.js";
import ContentSummaryPropertyValue from "../../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
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
  if (!value) {
    return (
      <Button
        onPress={onPress}
        className={cs.DocumentRefField.SelectButton.root}
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

  if (utils.isProtoCollectionId(value.collectionId)) {
    return (
      <Button
        onPress={!isReadOnly ? onPress : undefined}
        className={cs.DocumentRefField.SelectButton.root}
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
    <Button
      onPress={!isReadOnly ? onPress : undefined}
      className={cs.DocumentRefField.SelectButton.root}
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
  );
}
