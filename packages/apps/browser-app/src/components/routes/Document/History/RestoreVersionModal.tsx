import type {
  Collection,
  Document,
  LiteDocumentVersion,
} from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import {
  getDocumentVersionQuery,
  useCreateNewDocumentVersion,
} from "../../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../../business-logic/navigation/useNavigationState.js";
import Button from "../../../design-system/Button/Button.js";
import ModalDialog from "../../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../../design-system/ResultErrors/ResultErrors.js";
import * as cs from "./History.css.js";

interface Props {
  collection: Collection;
  document: Document;
  versionToRestore: LiteDocumentVersion;
  isOpen: boolean;
  onClose: () => void;
}
export default function RestoreVersionModal({
  collection,
  document,
  versionToRestore,
  isOpen,
  onClose,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const { result, mutate, isPending } = useCreateNewDocumentVersion();

  const handleRestore = async (content: Record<string, unknown>) => {
    const { success } = await mutate(
      collection.id,
      document.id,
      document.latestVersion.id,
      content,
    );
    if (success) {
      navigateTo({
        name: RouteName.Document,
        collectionId: collection.id,
        documentId: document.id,
      });
      onClose();
    }
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Restore version" />
      </ModalDialog.Heading>
      <DataLoader
        queries={[
          getDocumentVersionQuery([
            collection.id,
            document.id,
            versionToRestore.id,
          ]),
        ]}
        renderLoading={() => (
          <p>
            <FormattedMessage defaultMessage="Loading..." />
          </p>
        )}
        renderErrors={(errors) => <ResultErrors errors={errors} />}
      >
        {(documentVersion) => (
          <>
            <p>
              <FormattedMessage
                defaultMessage="Restore version from {date}? This will create a new version with the content from that point in time."
                values={{
                  date: intl.formatDate(versionToRestore.createdAt, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                }}
              />
            </p>
            <div className={cs.RestoreVersionModal.restoreButtonContainer}>
              <Button
                variant="primary"
                onPress={() => handleRestore(documentVersion.content)}
                isDisabled={isPending}
              >
                <FormattedMessage defaultMessage="Restore" />
              </Button>
            </div>
            {result?.error ? <ResultErrors errors={[result.error]} /> : null}
          </>
        )}
      </DataLoader>
    </ModalDialog>
  );
}
