import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type {
  Collection,
  DefaultDocumentViewUiOptions,
  Document,
  DocumentVersion,
} from "@superego/backend";
import { type Schema, valibotSchemas } from "@superego/schema";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { useCreateNewDocumentVersion } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import { DOCUMENT_AUTOSAVE_INTERVAL } from "../../../config.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../design-system/Alert/Alert.js";
import { Form } from "../../design-system/forms/forms.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
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

  const { control, handleSubmit, reset } = useForm<any>({
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

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      ref={formRef}
      id={formId}
      className={cs.CreateNewDocumentVersionForm.root}
    >
      <FormStateEffects
        control={control}
        formRef={formRef}
        autosaveInterval={DOCUMENT_AUTOSAVE_INTERVAL}
        setSubmitDisabled={setSubmitDisabled}
        triggerExitWarningWhenDirty={true}
        isDisabled={isReadOnly}
      />
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
        documentId={document.id}
      />
    </Form>
  );
}
