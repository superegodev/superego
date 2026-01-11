import type {
  Collection,
  Document as DocumentType,
  DocumentVersionId,
  MinimalDocumentVersion,
} from "@superego/backend";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import {
  getCollectionVersionQuery,
  getDocumentVersionQuery,
} from "../../../business-logic/backend/hooks.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import CreateNewDocumentVersionForm, {
  type ReadOnlyReason,
} from "./CreateNewDocumentVersionForm.js";

interface Props {
  collection: Collection;
  document: DocumentType;
  documentVersionId: DocumentVersionId;
  documentVersions: MinimalDocumentVersion[];
  formId: string;
  setSubmitDisabled: (disabled: boolean) => void;
  readOnlyReason: ReadOnlyReason | null;
}
export default function DocumentContent({
  collection,
  document,
  documentVersionId,
  documentVersions,
  formId,
  setSubmitDisabled,
  readOnlyReason,
}: Props) {
  if (documentVersionId === document.latestVersion.id) {
    return (
      <CreateNewDocumentVersionForm
        key={formId}
        collection={collection}
        document={document}
        formId={formId}
        setSubmitDisabled={setSubmitDisabled}
        readOnlyReason={readOnlyReason}
      />
    );
  }

  const documentVersion = documentVersions.find(
    ({ id }) => id === documentVersionId,
  );
  return documentVersion ? (
    <DataLoader
      queries={[
        getDocumentVersionQuery([
          collection.id,
          document.id,
          documentVersionId,
        ]),
        getCollectionVersionQuery([
          collection.id,
          documentVersion.collectionVersionId,
        ]),
      ]}
      renderErrors={(errors) => <ResultErrors errors={errors} />}
    >
      {(documentVersion, collectionVersion) => (
        <CreateNewDocumentVersionForm
          key={`${formId}_${documentVersion.id}`}
          collection={collection}
          collectionSchema={collectionVersion.schema}
          document={document}
          documentVersion={documentVersion}
          formId={formId}
          setSubmitDisabled={setSubmitDisabled}
          readOnlyReason="history-version"
        />
      )}
    </DataLoader>
  ) : null;
}
