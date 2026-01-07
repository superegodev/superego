import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { Form } from "react-aria-components";
import { useForm, useFormState } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useCreateDocument } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "./CreateDocument.css.js";

interface Props {
  collection: Collection;
}
export default function CreateDocumentForm({ collection }: Props) {
  const intl = useIntl();
  const { schema } = collection.latestVersion;
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateDocument();

  const { control, handleSubmit } = useForm<any>({
    defaultValues: forms.defaults.schemaValue(schema),
    mode: "onSubmit",
    resolver: standardSchemaResolver(valibotSchemas.content(schema, "rhf")),
  });

  const { isDirty } = useFormState({ control });

  useExitWarning(
    isDirty
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

  const onSubmit = async (content: any) => {
    const { success, data } = await mutate(
      collection.id,
      await forms.utils.RHFContent.fromRHFContent(content, schema),
    );
    if (success) {
      navigateTo(
        {
          name: RouteName.Document,
          collectionId: collection.id,
          documentId: data.id,
        },
        { ignoreExitWarning: true },
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <RHFContentField schema={schema} control={control} />
      <div className={cs.CreateDocumentForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Create" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </Form>
  );
}
