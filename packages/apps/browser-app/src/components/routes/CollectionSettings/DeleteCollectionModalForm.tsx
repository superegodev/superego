import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { object, pipe, string, value } from "valibot";
import { useDeleteCollection } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Alert from "../../design-system/Alert/Alert.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import RpcError from "../../design-system/RpcError/RpcError.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./CollectionSettings.css.js";

interface FormValues {
  commandConfirmation: string;
}

interface Props {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
}
export default function DeleteCollectionModalForm({
  collection,
  isOpen,
  onClose,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const collectionName = collection.settings.name;

  const { result, mutate } = useDeleteCollection();

  const schema = object({
    commandConfirmation: pipe(string(), value("delete")),
  });
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { commandConfirmation: "" },
    mode: "all",
    resolver: standardSchemaResolver(schema),
  });

  const onSubmit = async ({ commandConfirmation }: FormValues) => {
    const { success } = await mutate(collection.id, commandConfirmation);
    if (success) {
      navigateTo({ name: RouteName.Home });
    }
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage='Delete collection "{collectionName}"'
          values={{ collectionName }}
        />
      </ModalDialog.Heading>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <p>
          <FormattedMessage
            defaultMessage={`
              Deleting the collection will permanently delete all of its
              documents and files.
            `}
          />
        </p>
        <p>
          <FormattedMessage
            defaultMessage={`
              If you're sure you want to delete the collection, write
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
        <div className={cs.DeleteCollectionModalForm.submitButtonContainer}>
          <RHFSubmitButton control={control} variant="danger">
            <FormattedMessage defaultMessage="Delete" />
          </RHFSubmitButton>
        </div>
        {result?.error ? (
          <Alert
            variant="error"
            title={intl.formatMessage({
              defaultMessage: "Error deleting collection",
            })}
          >
            <RpcError error={result.error} />
          </Alert>
        ) : null}
      </Form>
    </ModalDialog>
  );
}
