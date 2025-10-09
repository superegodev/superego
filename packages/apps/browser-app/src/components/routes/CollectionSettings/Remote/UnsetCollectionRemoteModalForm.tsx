import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection, Remote } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUnsetCollectionRemote } from "../../../../business-logic/backend/hooks.js";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import toTitleCase from "../../../../utils/toTitleCase.js";
import ModalDialog from "../../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../../design-system/ResultErrors/ResultErrors.js";
import RHFSubmitButton from "../../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "../CollectionSettings.css.js";

interface FormValues {
  commandConfirmation: string;
}

interface Props {
  collection: Collection & { remote: Remote };
  isOpen: boolean;
  onClose: () => void;
}
export default function UnsetCollectionRemoteModalForm({
  collection,
  isOpen,
  onClose,
}: Props) {
  const intl = useIntl();

  const { result, mutate } = useUnsetCollectionRemote();

  const schema = v.strictObject({
    commandConfirmation: v.pipe(v.string(), v.value("unset")),
  });
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { commandConfirmation: "" },
    mode: "all",
    resolver: standardSchemaResolver(schema),
  });

  const onSubmit = ({ commandConfirmation }: FormValues) => {
    mutate(collection.id, commandConfirmation);
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage='Unset "{remote}" remote'
          values={{ remote: toTitleCase(collection.remote.connector.name) }}
        />
      </ModalDialog.Heading>
      <FormattedMessage
        defaultMessage={`
          <p>
            Unsetting the remote will permanently delete all the documents and
            files synced from it.
          </p>
          <p>
            If you're sure you want to unset the remote, write <i>unset</i> in
            the input below.
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
          placeholder="unset"
          showErrorOnError={false}
        />
        <div
          className={cs.UnsetCollectionRemoteModalForm.submitButtonContainer}
        >
          <RHFSubmitButton control={control} variant="danger">
            <FormattedMessage defaultMessage="Unset" />
          </RHFSubmitButton>
        </div>
        {result?.error ? <ResultErrors errors={[result.error]} /> : null}
      </Form>
    </ModalDialog>
  );
}
