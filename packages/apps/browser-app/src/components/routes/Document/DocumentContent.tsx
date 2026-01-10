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
import CreateNewDocumentVersionForm from "./CreateNewDocumentVersionForm.js";

interface Props {
  collection: Collection;
  document: DocumentType;
  documentVersionId: DocumentVersionId;
  documentVersions: MinimalDocumentVersion[];
  formId: string;
  setSubmitDisabled: (disabled: boolean) => void;
  isReadOnly: boolean;
}
export default function DocumentContent({
  collection,
  document,
  documentVersionId,
  documentVersions,
  formId,
  setSubmitDisabled,
  isReadOnly,
}: Props) {
  if (documentVersionId === document.latestVersion.id) {
    return (
      <CreateNewDocumentVersionForm
        key={formId}
        collection={collection}
        document={document}
        formId={formId}
        setSubmitDisabled={setSubmitDisabled}
        isReadOnly={isReadOnly}
        collectionSchema={collection.latestVersion.schema}
        documentContent={document.latestVersion.content}
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
          document={document}
          formId={formId}
          setSubmitDisabled={setSubmitDisabled}
          isReadOnly={true}
          collectionSchema={collectionVersion.schema}
          documentContent={documentVersion.content}
        />
      )}
    </DataLoader>
  ) : null;
}
