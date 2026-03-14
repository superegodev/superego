import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { App, CollectionId } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import * as v from "valibot";
import { useCreateNewAppVersion } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import type { RHFAppVersionFiles } from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import RHFAppVersionFilesUtils from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
import RHFAppVersionField from "../../widgets/RHFAppVersionField/RHFAppVersionField.js";
import * as cs from "./EditApp.css.js";

interface FormValues {
  appVersion: {
    targetCollectionIds: CollectionId[];
    files: RHFAppVersionFiles;
  };
}

interface Props {
  app: App;
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
}
export default function CreateNewAppVersionForm({
  app,
  formId,
  setSubmitDisabled,
}: Props) {
  const intl = useIntl();

  const { mutate } = useCreateNewAppVersion();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      appVersion: {
        targetCollectionIds: app.latestVersion.targetCollections.map(
          ({ id }) => id,
        ),
        files: RHFAppVersionFilesUtils.toRhfAppVersionFiles(
          app.latestVersion.files,
        ),
      },
    },
    mode: "onSubmit",
    resolver: standardSchemaResolver(
      v.strictObject({
        appVersion: v.strictObject({
          targetCollectionIds: v.pipe(
            v.array(valibotSchemas.id.collection()),
            v.minLength(1),
          ),
          files: forms.schemas.rhfAppVersionFiles(intl),
        }),
      }),
    ),
  });

  const onSubmit = async ({ appVersion }: FormValues) => {
    const { success, data, error } = await mutate(
      app.id,
      appVersion.targetCollectionIds,
      RHFAppVersionFilesUtils.fromRhfAppVersionFiles(appVersion.files),
    );
    if (success) {
      reset(
        {
          appVersion: {
            targetCollectionIds: data.latestVersion.targetCollections.map(
              ({ id }) => id,
            ),
            files: RHFAppVersionFilesUtils.toRhfAppVersionFiles(
              data.latestVersion.files,
            ),
          },
        },
        { keepValues: true },
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
      <FormStateEffects
        control={control}
        setSubmitDisabled={setSubmitDisabled}
        triggerExitWarningWhenDirty={true}
      />
      <RHFAppVersionField control={control} name="appVersion" app={app} />
    </Form>
  );
}
