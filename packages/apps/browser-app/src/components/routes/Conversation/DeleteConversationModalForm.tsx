import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Conversation } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useDeleteConversation } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import Alert from "../../design-system/Alert/Alert.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultError from "../../design-system/ResultError/ResultError.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./Conversation.css.js";

interface FormValues {
  commandConfirmation: string;
}

interface Props {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}
export default function DeleteConversationModalForm({
  conversation,
  isOpen,
  onClose,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const conversationName = ConversationUtils.getDisplayName(conversation);

  const { result, mutate } = useDeleteConversation();

  const schema = v.strictObject({
    commandConfirmation: v.pipe(v.string(), v.value("delete")),
  });
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { commandConfirmation: "" },
    mode: "all",
    resolver: standardSchemaResolver(schema),
  });

  const onSubmit = async ({ commandConfirmation }: FormValues) => {
    const { success } = await mutate(conversation.id, commandConfirmation);
    if (success) {
      navigateTo({ name: RouteName.Home });
    }
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage='Delete conversation "{conversationName}"'
          values={{ conversationName }}
        />
      </ModalDialog.Heading>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <p>
          <FormattedMessage defaultMessage="Deleting the conversation is permanent." />
        </p>
        <p>
          <FormattedMessage
            defaultMessage={`
              If you're sure you want to delete the conversation, write
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
        <div className={cs.DeleteConversationModalForm.submitButtonContainer}>
          <RHFSubmitButton control={control} variant="danger">
            <FormattedMessage defaultMessage="Delete" />
          </RHFSubmitButton>
        </div>
        {result?.error ? (
          <Alert
            variant="error"
            title={intl.formatMessage({
              defaultMessage: "Error deleting conversation",
            })}
          >
            <ResultError error={result.error} />
          </Alert>
        ) : null}
      </Form>
    </ModalDialog>
  );
}
