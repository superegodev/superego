import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection, Document } from "@superego/backend";
import { type Schema, valibotSchemas } from "@superego/schema";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useCreateNewDocumentVersion } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import { DOCUMENT_AUTOSAVE_INTERVAL } from "../../../config.js";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.js";

interface Props {
  collection: Collection;
  document: Document;
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
  isReadOnly: boolean;
  collectionSchema: Schema;
  documentContent: any;
}
export default function CreateNewDocumentVersionForm({
  collection,
  document,
  formId,
  setSubmitDisabled,
  isReadOnly,
  collectionSchema,
  documentContent,
}: Props) {
  const intl = useIntl();

  const { mutate } = useCreateNewDocumentVersion();

  const { control, handleSubmit, reset, formState } = useForm<any>({
    defaultValues: forms.utils.RHFContent.toRHFContent(
      documentContent,
      collectionSchema,
    ),
    mode: "all",
    resolver: standardSchemaResolver(
      valibotSchemas.content(collectionSchema, "rhf"),
    ),
  });

  // Update the form when the document content changed. Uses a ref to keep track
  // of the current version id so that the effect is not run for changes
  // originated from a form submission, as the submission already takes care of
  // updating the form, and we don't want to unnecessarily reset the form to
  // prevent ill-effects such as the cursor jumping around for the user.
  //
  // Note on the hook dependencies: the actual value of the documentContent
  // object only changes when document.latestVersion.id changes. The object
  // reference though might change, for example if the query for the document is
  // invalidated and re-fetched. In that case we don't care to update the form
  // though.
  const latestVersionIdRef = useRef(document.latestVersion.id);
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (document.latestVersion.id !== latestVersionIdRef.current) {
      reset(
        forms.utils.RHFContent.toRHFContent(documentContent, collectionSchema),
      );
      latestVersionIdRef.current = document.latestVersion.id;
    }
  }, [document.latestVersion.id]);

  const onSubmit = async (contentData: any) => {
    const { success, data, error } = await mutate(
      collection.id,
      document.id,
      document.latestVersion.id,
      await forms.utils.RHFContent.fromRHFContent(
        contentData,
        collectionSchema,
      ),
    );
    if (success) {
      reset(
        forms.utils.RHFContent.toRHFContent(
          data.latestVersion.content,
          collectionSchema,
        ),
        { keepValues: true },
      );
      latestVersionIdRef.current = data.latestVersion.id;
    } else {
      console.error(error);
      toasts.add({
        type: ToastType.Error,
        title: intl.formatMessage({ defaultMessage: "Error saving document" }),
        error: error,
      });
    }
  };

  // When the form dirty state changes:
  // - Enable or disable the submit button.
  // - If the form is dirty, schedule an autosave.
  const formRef = useRef<HTMLFormElement>(null);
  // Temporary workaround for https://github.com/react-hook-form/react-hook-form/issues/13141
  const isDirty = Object.values(formState.dirtyFields).length !== 0;
  useEffect(() => {
    setSubmitDisabled(!isDirty);
    if (isReadOnly || !isDirty || !formState.isValid) {
      return;
    }
    const timeoutId = setTimeout(
      () => formRef.current?.requestSubmit(),
      DOCUMENT_AUTOSAVE_INTERVAL,
    );
    return () => clearTimeout(timeoutId);
  }, [isReadOnly, isDirty, formState.isValid, setSubmitDisabled]);

  useExitWarning(
    isDirty && !isReadOnly
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)} ref={formRef} id={formId}>
      <RHFContentField schema={collectionSchema} control={control} />
    </Form>
  );
}
