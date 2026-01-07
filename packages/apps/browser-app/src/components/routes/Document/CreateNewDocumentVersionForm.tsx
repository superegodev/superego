import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type {
  Collection,
  CollectionVersion,
  Document,
  DocumentVersion,
} from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useCreateNewDocumentVersion } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import { DOCUMENT_AUTOSAVE_INTERVAL } from "../../../config.js";
import Alert from "../../design-system/Alert/Alert.js";
import Button from "../../design-system/Button/Button.js";
import ThreeDotSpinner from "../../design-system/ThreeDotSpinner/ThreeDotSpinner.js";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.js";
import { useDocumentHistory } from "./DocumentHistoryContext.js";

interface Props {
  collection: Collection;
  document: Document;
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
  isReadOnly: boolean;
  /** When viewing a historical version */
  viewingVersion?: DocumentVersion | undefined;
  /** When viewing a historical version with a different collection schema */
  viewingCollectionVersion?: CollectionVersion | undefined;
  /** When the historical version is still loading */
  isLoadingVersion?: boolean | undefined;
  /** When there was an error loading the historical version */
  versionLoadError?: boolean | undefined;
}

export default function CreateNewDocumentVersionForm({
  collection,
  document,
  formId,
  setSubmitDisabled,
  isReadOnly,
  viewingVersion,
  viewingCollectionVersion,
  isLoadingVersion,
  versionLoadError,
}: Props) {
  const intl = useIntl();
  const { selectVersion } = useDocumentHistory();

  // Determine which content and schema to use
  const isViewingHistoricalVersion = viewingVersion !== undefined;
  const content = isViewingHistoricalVersion
    ? viewingVersion.content
    : document.latestVersion.content;
  const schema = viewingCollectionVersion?.schema ?? collection.latestVersion.schema;

  const { mutate } = useCreateNewDocumentVersion();

  const { control, handleSubmit, reset, formState } = useForm<any>({
    defaultValues: forms.utils.RHFContent.toRHFContent(content, schema),
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
  const viewingVersionIdRef = useRef(viewingVersion?.id);
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    // Handle changes to the viewing version (when user selects a different historical version)
    if (viewingVersion?.id !== viewingVersionIdRef.current) {
      if (viewingVersion) {
        reset(
          forms.utils.RHFContent.toRHFContent(viewingVersion.content, schema),
        );
      }
      viewingVersionIdRef.current = viewingVersion?.id;
    }
    // Handle changes to the latest version (when not viewing historical)
    else if (
      !isViewingHistoricalVersion &&
      document.latestVersion.id !== latestVersionIdRef.current
    ) {
      reset(
        forms.utils.RHFContent.toRHFContent(
          document.latestVersion.content,
          collection.latestVersion.schema,
        ),
      );
      latestVersionIdRef.current = document.latestVersion.id;
    }
  }, [document.latestVersion.id, viewingVersion?.id]);

  const onSubmit = async (contentData: any) => {
    const { success, data, error } = await mutate(
      collection.id,
      document.id,
      document.latestVersion.id,
      await forms.utils.RHFContent.fromRHFContent(
        contentData,
        collection.latestVersion.schema,
      ),
    );
    if (success) {
      reset(
        forms.utils.RHFContent.toRHFContent(
          data.latestVersion.content,
          collection.latestVersion.schema,
        ),
        {
          keepValues: true,
        },
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

  const shouldWarn = isDirty && !isReadOnly;
  useExitWarning(
    shouldWarn
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

  // Show loading state when fetching historical version
  if (isLoadingVersion) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <ThreeDotSpinner />
      </div>
    );
  }

  // Show error state when failed to load historical version
  if (versionLoadError) {
    return (
      <Alert variant="error">
        <FormattedMessage defaultMessage="Failed to load version" />
      </Alert>
    );
  }

  const formattedVersionDate = viewingVersion
    ? intl.formatDate(new Date(viewingVersion.createdAt), {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      {isViewingHistoricalVersion && (
        <Alert variant="info">
          <FormattedMessage
            defaultMessage="Viewing version from {date}"
            values={{ date: formattedVersionDate }}
          />
          <div style={{ marginTop: "0.5rem" }}>
            <Button variant="default" onPress={() => selectVersion(null)}>
              <FormattedMessage defaultMessage="View current version" />
            </Button>
          </div>
        </Alert>
      )}
      <Form onSubmit={handleSubmit(onSubmit)} ref={formRef} id={formId}>
        <RHFContentField schema={schema} control={control} />
      </Form>
    </>
  );
}
