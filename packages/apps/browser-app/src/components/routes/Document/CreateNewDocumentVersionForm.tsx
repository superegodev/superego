import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type {
  Collection,
  DefaultDocumentViewUiOptions,
  Document,
  DocumentVersion,
} from "@superego/backend";
import { type Schema, valibotSchemas } from "@superego/schema";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { useCreateNewDocumentVersion } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import { DOCUMENT_AUTOSAVE_INTERVAL } from "../../../config.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../design-system/Alert/Alert.js";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.js";
import * as cs from "./Document.css.js";

export type ReadOnlyReason = "remote" | "history-version";

interface Props {
  collection: Collection;
  collectionSchema?: Schema;
  defaultDocumentViewUiOptions?: DefaultDocumentViewUiOptions | null;
  document: Document;
  documentVersion?: DocumentVersion;
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
  readOnlyReason: ReadOnlyReason | null;
}
export default function CreateNewDocumentVersionForm({
  collection,
  collectionSchema = collection.latestVersion.schema,
  defaultDocumentViewUiOptions = collection.latestVersion.settings
    .defaultDocumentViewUiOptions,
  document,
  documentVersion = document.latestVersion,
  formId,
  setSubmitDisabled,
  readOnlyReason,
}: Props) {
  const intl = useIntl();

  const isReadOnly = readOnlyReason !== null;

  const { mutate } = useCreateNewDocumentVersion();

  const { control, handleSubmit, reset, formState } = useForm<any>({
    defaultValues: forms.utils.RHFContent.toRHFContent(
      documentVersion.content,
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
        forms.utils.RHFContent.toRHFContent(
          documentVersion.content,
          collectionSchema,
        ),
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
      {readOnlyReason !== null ? (
        <Alert
          variant="info"
          className={cs.CreateNewDocumentVersionForm.readOnlyAlert}
        >
          {readOnlyReason === "remote" ? (
            <FormattedMessage defaultMessage="This document is synced from a remote source and cannot be edited." />
          ) : (
            <FormattedMessage
              defaultMessage="Viewing document version from <b>{date}</b>. Document editing is disabled."
              values={{
                date: (
                  <FormattedDate
                    value={documentVersion.createdAt}
                    dateStyle="medium"
                    timeStyle="medium"
                  />
                ),
                ...formattedMessageHtmlTags,
              }}
            />
          )}
        </Alert>
      ) : null}
      <RHFContentField
        schema={collectionSchema}
        control={control}
        isReadOnly={isReadOnly}
        defaultDocumentViewUiOptions={defaultDocumentViewUiOptions}
      />
    </Form>
  );
}
