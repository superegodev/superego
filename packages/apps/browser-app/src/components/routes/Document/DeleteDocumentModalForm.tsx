import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Document } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useDeleteDocument } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import Button from "../../design-system/Button/Button.js";
import ContentSummaryPropertyValue from "../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";

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

  const { result, mutate } = useDeleteDocument();

  const schema = v.strictObject({
    commandConfirmation: v.pipe(v.string(), v.value("delete")),
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
          values={{
            documentName: (
              <ContentSummaryPropertyValue
                value={DocumentUtils.getDisplayName(document)}
              />
            ),
          }}
        />
      </ModalDialog.Heading>
      <FormattedMessage
        defaultMessage={`
          <p>
            Deleting the document will permanently delete the document, all its
            versions, and all its files.
          </p>
          <p>
            If you're sure you want to delete the document, write <i>delete</i>
            in the input below.
          </p>
        `}
        values={formattedMessageHtmlTags}
      />
      <Form onSubmit={handleSubmit(onSubmit)}>
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
        <ModalDialog.Actions>
          <Button onPress={onClose}>
            <FormattedMessage defaultMessage="Cancel" />
          </Button>
          <RHFSubmitButton control={control} variant="danger">
            <FormattedMessage defaultMessage="Delete" />
          </RHFSubmitButton>
        </ModalDialog.Actions>
        {result?.error ? <ResultErrors errors={[result.error]} /> : null}
      </Form>
    </ModalDialog>
  );
}
