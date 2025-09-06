import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection, Document } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useCreateNewDocumentVersion } from "../../../business-logic/backend/hooks.js";
import { DOCUMENT_AUTOSAVE_INTERVAL } from "../../../config.js";
import RhfContent from "../../../utils/RhfContent.js";
import Alert from "../../design-system/Alert/Alert.js";
import ResultError from "../../design-system/ResultError/ResultError.js";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.js";

interface Props {
  collection: Collection;
  document: Document;
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
}
export default function CreateNewDocumentVersionForm({
  collection,
  document,
  formId,
  setSubmitDisabled,
}: Props) {
  const { schema } = collection.latestVersion;
  const intl = useIntl();

  const { result, mutate } = useCreateNewDocumentVersion();

  const { control, handleSubmit, reset, formState } = useForm<any>({
    defaultValues: RhfContent.toRhfContent(
      document.latestVersion.content,
      schema,
    ),
    mode: "all",
    resolver: standardSchemaResolver(valibotSchemas.content(schema, "rhf")),
  });

  const onSubmit = async (content: any) => {
    const { success, data } = await mutate(
      collection.id,
      document.id,
      document.latestVersion.id,
      RhfContent.fromRhfContent(content, schema),
    );
    if (success) {
      reset(RhfContent.toRhfContent(data.latestVersion.content, schema), {
        keepValues: true,
      });
    } else {
      // TODO: display error in Toast.
    }
  };

  // When the form dirty state changes:
  // - Enable or disable the submit button.
  // - If the form is dirty, schedule an autosave.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setSubmitDisabled(!formState.isDirty);
    if (!formState.isDirty || !formState.isValid) {
      return;
    }
    const timeoutId = setTimeout(
      () => formRef.current?.requestSubmit(),
      DOCUMENT_AUTOSAVE_INTERVAL,
    );
    return () => clearTimeout(timeoutId);
  }, [formState.isDirty, formState.isValid, setSubmitDisabled]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} ref={formRef} id={formId}>
      <RHFContentField schema={schema} control={control} document={document} />
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error updating document",
          })}
        >
          <ResultError error={result.error} />
        </Alert>
      ) : null}
    </Form>
  );
}
