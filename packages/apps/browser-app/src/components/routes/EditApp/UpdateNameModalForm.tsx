import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { App } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateAppName } from "../../../business-logic/backend/hooks.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./EditApp.css.js";

interface FormValues {
  name: string;
}

interface Props {
  app: App;
  isOpen: boolean;
  onClose: () => void;
}
export default function UpdateNameModalForm({ app, isOpen, onClose }: Props) {
  const intl = useIntl();

  const { result, mutate } = useUpdateAppName();

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { name: app.name },
    mode: "all",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.appName(),
      }),
    ),
  });

  const onSubmit = async ({ name }: FormValues) => {
    const { success } = await mutate(app.id, name);
    if (success) {
      onClose();
    }
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Update app name" />
      </ModalDialog.Heading>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <RHFTextField
          control={control}
          name="name"
          autoFocus={true}
          label={intl.formatMessage({ defaultMessage: "Name" })}
          placeholder={intl.formatMessage({ defaultMessage: "My Awesome App" })}
        />
        <div className={cs.UpdateNameModalForm.submitButtonContainer}>
          <RHFSubmitButton control={control} variant="primary">
            <FormattedMessage defaultMessage="Update" />
          </RHFSubmitButton>
        </div>
        {result?.error ? <ResultErrors errors={[result.error]} /> : null}
      </Form>
    </ModalDialog>
  );
}
