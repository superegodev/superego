import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection, DuplicateDocumentDetected } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { useState } from "react";
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
import DuplicateDocumentDetectedModal from "./DuplicateDocumentDetectedModal.js";

interface Props {
  collection: Collection;
}
export default function CreateDocumentForm({ collection }: Props) {
  const intl = useIntl();
  const { schema } = collection.latestVersion;
  const { navigateTo } = useNavigationState();

  const { result, mutate, isPending } = useCreateDocument();

  const [duplicateError, setDuplicateError] =
    useState<DuplicateDocumentDetected | null>(null);
  const [pendingContent, setPendingContent] = useState<any>(null);

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

  const createDocument = async (content: any, skipDuplicateCheck: boolean) => {
    const { success, data, error } = await mutate(collection.id, content, {
      skipDuplicateCheck,
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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <RHFContentField schema={schema} control={control} />
        <div className={cs.CreateDocumentForm.submitButtonContainer}>
          <RHFSubmitButton control={control} variant="primary">
            <FormattedMessage defaultMessage="Create" />
          </RHFSubmitButton>
        </div>
        {result?.error && result.error.name !== "DuplicateDocumentDetected" ? (
          <ResultErrors errors={[result.error]} />
        ) : null}
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
