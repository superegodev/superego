import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Document } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { object, pipe, string, value } from "valibot";
import { useDeleteDocument } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import Alert from "../../design-system/Alert/Alert.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import RpcError from "../../design-system/RpcError/RpcError.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./Document.css.js";

interface FormValues {
  commandConfirmation: string;
}

interface Props {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}
export default function DeleteDocumentModalForm({
  document,
  isOpen,
  onClose,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const documentName = DocumentUtils.getDisplayName(document);

  const { result, mutate } = useDeleteDocument();

  const schema = object({
    commandConfirmation: pipe(string(), value("delete")),
  });
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { commandConfirmation: "" },
    mode: "all",
    resolver: standardSchemaResolver(schema),
  });

  const onSubmit = async ({ commandConfirmation }: FormValues) => {
    const { success } = await mutate(
      document.collectionId,
      document.id,
      commandConfirmation,
    );
    if (success) {
      navigateTo({
        name: RouteName.Collection,
        collectionId: document.collectionId,
      });
    }
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage='Delete document "{documentName}"'
          values={{ documentName }}
        />
      </ModalDialog.Heading>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <p>
          <FormattedMessage
            defaultMessage={`
              Deleting the document will permanently delete the document, all
              its versions, and all its files.
            `}
          />
        </p>
        <p>
          <FormattedMessage
            defaultMessage={`
              If you're sure you want to delete the document, write
              <em>delete</em> in the input below.
            `}
            values={{ em: (chunks) => <em>{chunks}</em> }}
          />
        </p>
        <RHFTextField
          control={control}
          name="commandConfirmation"
          autoFocus={true}
          ariaLabel={intl.formatMessage({
            defaultMessage: "Command confirmation",
          })}
          placeholder="delete"
          showErrorOnError={false}
        />
        <div className={cs.DeleteDocumentModalForm.submitButtonContainer}>
          <RHFSubmitButton control={control} variant="danger">
            <FormattedMessage defaultMessage="Delete" />
          </RHFSubmitButton>
        </div>
        {result?.error ? (
          <Alert
            variant="error"
            title={intl.formatMessage({
              defaultMessage: "Error deleting document",
            })}
          >
            <RpcError error={result.error} />
          </Alert>
        ) : null}
      </Form>
    </ModalDialog>
  );
}
