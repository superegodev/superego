import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { App } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useDeleteApp } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import AppUtils from "../../../utils/AppUtils.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./EditApp.css.js";

interface FormValues {
  commandConfirmation: string;
}

interface Props {
  app: App;
  isOpen: boolean;
  onClose: () => void;
}
export default function DeleteAppModalForm({ app, isOpen, onClose }: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useDeleteApp();

  const schema = v.strictObject({
    commandConfirmation: v.pipe(v.string(), v.value("delete")),
  });
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { commandConfirmation: "" },
    mode: "all",
    resolver: standardSchemaResolver(schema),
  });

  const onSubmit = async ({ commandConfirmation }: FormValues) => {
    const { success } = await mutate(app.id, commandConfirmation);
    if (success) {
      const firstTargetedCollectionId =
        AppUtils.getFirstTargetCollectionId(app);
      navigateTo(
        firstTargetedCollectionId
          ? {
              name: RouteName.Collection,
              collectionId: firstTargetedCollectionId,
            }
          : { name: RouteName.Ask },
      );
    }
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage='Delete app "{appName}"'
          values={{ appName: app.name }}
        />
      </ModalDialog.Heading>
      <FormattedMessage
        defaultMessage={`
          <p>
            Deleting the app is permanent. If you're sure, write <i>delete</i>
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
        <div className={cs.DeleteAppModalForm.submitButtonContainer}>
          <RHFSubmitButton control={control} variant="danger">
            <FormattedMessage defaultMessage="Delete" />
          </RHFSubmitButton>
        </div>
        {result?.error ? <ResultErrors errors={[result.error]} /> : null}
      </Form>
    </ModalDialog>
  );
}
