import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { App, Collection } from "@superego/backend";
import { useEffect } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import * as v from "valibot";
import { useCreateNewAppVersion } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import type { RHFAppVersionFiles } from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import RHFAppVersionFilesUtils from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toastQueue from "../../../business-logic/toasts/toastQueue.js";
import AppUtils from "../../../utils/AppUtils.js";
import RHFAppVersionFilesField from "../../widgets/RHFAppVersionFilesField/RHFAppVersionFilesField.jsx";
import * as cs from "./EditApp.css.js";

interface FormValues {
  files: RHFAppVersionFiles;
}

interface Props {
  app: App;
  targetCollections: Collection[];
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
}
export default function CreateNewAppVersionForm({
  app,
  targetCollections,
  formId,
  setSubmitDisabled,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { mutate } = useCreateNewAppVersion();

  const { control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      files: RHFAppVersionFilesUtils.toRhfAppVersionFiles(
        app.latestVersion.files,
      ),
    },
    mode: "onSubmit",
    resolver: standardSchemaResolver(
      v.strictObject({
        files: forms.schemas.rhfAppVersionFiles(intl),
      }),
    ),
  });

  // When the form dirty state changes, enable or disable the submit button.
  useEffect(() => {
    setSubmitDisabled(!formState.isDirty);
  }, [formState.isDirty, setSubmitDisabled]);

  const onSubmit = async ({ files }: FormValues) => {
    const { success, data, error } = await mutate(
      app.id,
      app.latestVersion.targetCollections.map(({ id }) => id),
      RHFAppVersionFilesUtils.fromRhfAppVersionFiles(files),
    );
    if (success) {
      const firstTargetedCollectionId =
        AppUtils.getFirstTargetCollectionId(data);
      navigateTo(
        firstTargetedCollectionId
          ? {
              name: RouteName.Collection,
              collectionId: firstTargetedCollectionId,
              activeAppId: data.id,
            }
          : { name: RouteName.Ask },
      );
    } else {
      console.error(error);
      toastQueue.add(
        {
          type: ToastType.Error,
          title: intl.formatMessage({
            defaultMessage: "Error creating a new app version",
          }),
          description: error.name,
        },
        { timeout: 5_000 },
      );
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      id={formId}
      className={cs.CreateNewAppVersionForm.root}
    >
      <RHFAppVersionFilesField
        control={control}
        name="files"
        targetCollections={targetCollections}
      />
    </Form>
  );
}
