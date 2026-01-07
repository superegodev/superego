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
import {
  CollectionRouteView,
  RouteName,
} from "../../../business-logic/navigation/Route.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import AppUtils from "../../../utils/AppUtils.js";
import RHFAppVersionFilesField from "../../widgets/RHFAppVersionFilesField/RHFAppVersionFilesField.js";
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

  useExitWarning(
    formState.isDirty
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

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
              view: CollectionRouteView.App,
              appId: data.id,
            }
          : { name: RouteName.Ask },
        { ignoreExitWarning: true },
      );
    } else {
      console.error(error);
      toasts.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "Error creating a new app version",
        }),
        error: error,
      });
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
        app={app}
        targetCollections={targetCollections}
      />
    </Form>
  );
}
