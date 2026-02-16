import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection, DuplicateDocumentDetected } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { useIntl } from "react-intl";
import { useCreateDocument } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import { Form } from "../../design-system/forms/forms.js";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.js";
import * as cs from "./CreateDocument.css.js";
import DuplicateDocumentDetectedModal from "./DuplicateDocumentDetectedModal.js";

interface Props {
  collection: Collection;
  formId: string;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
}
export default function CreateDocumentForm({
  collection,
  formId,
  setSubmitDisabled,
}: Props) {
  const intl = useIntl();
  const { schema } = collection.latestVersion;
  const { navigateTo } = useNavigationState();

  const { mutate, isPending } = useCreateDocument();

  const [duplicateError, setDuplicateError] =
    useState<DuplicateDocumentDetected | null>(null);
  const [pendingContent, setPendingContent] = useState<any>(null);

  const { control, handleSubmit } = useForm<any>({
    defaultValues: forms.defaults.schemaValue(schema),
    mode: "onSubmit",
    resolver: standardSchemaResolver(valibotSchemas.content(schema, "rhf")),
  });

  const { isDirty, isSubmitting } = useFormState({ control });

  useEffect(() => {
    setSubmitDisabled(isSubmitting);
  }, [isSubmitting, setSubmitDisabled]);

  useExitWarning(
    isDirty
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

  const createDocument = async (content: any, skipDuplicateCheck: boolean) => {
    const { success, data, error } = await mutate({
      collectionId: collection.id,
      content,
      options: { skipDuplicateCheck },
    });
    if (success) {
      navigateTo(
        {
          name: RouteName.Document,
          collectionId: collection.id,
          documentId: data.id,
        },
        { ignoreExitWarning: true },
      );
    } else if (error?.name === "DuplicateDocumentDetected") {
      setPendingContent(content);
      setDuplicateError(error);
    } else if (error) {
      console.error(error);
      toasts.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "Error creating document",
        }),
        error,
      });
    }
  };

  const onSubmit = async (rhfContent: any) => {
    const content = await forms.utils.RHFContent.fromRHFContent(
      rhfContent,
      schema,
    );
    await createDocument(content, false);
  };

  const handleCreateAnyway = async () => {
    if (pendingContent) {
      await createDocument(pendingContent, true);
      setDuplicateError(null);
      setPendingContent(null);
    }
  };

  const handleCloseDuplicateModal = () => {
    setDuplicateError(null);
    setPendingContent(null);
  };

  return (
    <>
      <Form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className={cs.CreateDocumentForm.root}
      >
        <RHFContentField
          schema={schema}
          control={control}
          defaultDocumentViewUiOptions={
            collection.latestVersion.settings.defaultDocumentViewUiOptions
          }
        />
      </Form>
      {duplicateError ? (
        <DuplicateDocumentDetectedModal
          error={duplicateError}
          isOpen={true}
          onClose={handleCloseDuplicateModal}
          onCreateAnyway={handleCreateAnyway}
          isCreating={isPending}
        />
      ) : null}
    </>
  );
}
