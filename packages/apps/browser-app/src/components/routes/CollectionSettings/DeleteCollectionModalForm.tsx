import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useDeleteCollection } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.jsx";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
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

  const schema = v.strictObject({
    commandConfirmation: v.pipe(v.string(), v.value("delete")),
  });
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { commandConfirmation: "" },
    mode: "all",
    resolver: standardSchemaResolver(schema),
  });

  const onSubmit = async ({ commandConfirmation }: FormValues) => {
    const { success } = await mutate(collection.id, commandConfirmation);
    if (success) {
      navigateTo({ name: RouteName.Ask });
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
        <FormattedMessage
          defaultMessage={`
            <p>
              Deleting the collection will permanently delete all of its
              documents and files.
            </p>
            <p>
              If you're sure you want to delete the collection, write
              <i>delete</i> in the input below.
            </p>
          `}
          values={formattedMessageHtmlTags}
        />
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
        {result?.error ? <ResultErrors errors={[result.error]} /> : null}
      </Form>
    </ModalDialog>
  );
}
