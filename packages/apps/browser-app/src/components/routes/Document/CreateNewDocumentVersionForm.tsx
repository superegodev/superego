import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection, Document } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useCreateNewDocumentVersion } from "../../../business-logic/backend/hooks.js";
import { DOCUMENT_AUTOSAVE_INTERVAL } from "../../../config.js";
import RhfContent from "../../../utils/RhfContent.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
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

  const { result, mutate } = useCreateNewDocumentVersion();

  const { control, handleSubmit, reset, formState } = useForm<any>({
    defaultValues: RhfContent.toRhfContent(
      document.latestVersion.content,
      schema,
    ),
    mode: "all",
    resolver: standardSchemaResolver(valibotSchemas.content(schema, "rhf")),
  });

  // Update the form when the document content changed. Uses a ref to keep track
  // of the current version id so that the effect is not run for changes
  // originated from a form submission, as the submission already takes care of
  // updating the form, and we don't want to unnecessarily reset the form to
  // prevent ill-effects such as the cursor jumping around for the user.
  //
  // Not on the hook dependencies: the actual value of the
  // document.latestVersion.content object only changes when
  // document.latestVersion.id changes. The object reference though might
  // change, for example if the query for the document is invalidated and
  // re-fetched. In that case we don't care to update the form though.
  const latestVersionIdRef = useRef(document.latestVersion.id);
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (document.latestVersion.id !== latestVersionIdRef.current) {
      reset(RhfContent.toRhfContent(document.latestVersion.content, schema));
      latestVersionIdRef.current = document.latestVersion.id;
    }
  }, [document.latestVersion.id]);

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
      latestVersionIdRef.current = data.latestVersion.id;
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
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </Form>
  );
}
