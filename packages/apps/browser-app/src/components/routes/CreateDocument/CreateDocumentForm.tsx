import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useCreateDocument } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import generateDefaultValues from "../../../utils/generateDefaultValues.js";
import RhfContent from "../../../utils/RhfContent.js";
import Alert from "../../design-system/Alert/Alert.js";
import RpcError from "../../design-system/RpcError/RpcError.js";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "./CreateDocument.css.js";

interface Props {
  collection: Collection;
}
export default function CreateDocumentForm({ collection }: Props) {
  const { schema } = collection.latestVersion;
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateDocument();

  const { control, handleSubmit } = useForm<any>({
    defaultValues: generateDefaultValues(schema),
    mode: "onSubmit",
    resolver: standardSchemaResolver(valibotSchemas.content(schema, "rhf")),
  });

  const onSubmit = async (content: any) => {
    const { success, data } = await mutate(
      collection.id,
      RhfContent.fromRhfContent(content, schema),
    );
    if (success) {
      navigateTo({
        name: RouteName.Document,
        collectionId: collection.id,
        documentId: data.id,
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <RHFContentField schema={schema} control={control} document={null} />
      <div className={cs.CreateDocumentForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Create" />
        </RHFSubmitButton>
      </div>
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error creating document",
          })}
        >
          <RpcError error={result.error} />
        </Alert>
      ) : null}
    </Form>
  );
}
