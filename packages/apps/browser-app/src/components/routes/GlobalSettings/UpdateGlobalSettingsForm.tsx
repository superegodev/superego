import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { GlobalSettings, Theme } from "@superego/backend";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useUpdateGlobalSettings } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import { SETTINGS_AUTOSAVE_INTERVAL } from "../../../config.js";
import applyTheme from "../../../utils/applyTheme.js";
import FullPageTabs from "../../design-system/FullPageTabs/FullPageTabs.js";
import AppearanceSettings from "./AppearanceSettings.js";
import AssistantsSettings from "./AssistantsSettings.js";
import InferenceSettings from "./InferenceSettings.js";

interface Props {
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
}
export default function UpdateGlobalSettingsForm({
  formId,
  setSubmitDisabled,
}: Props) {
  const intl = useIntl();
  const { globalSettings, developerPrompts } = useGlobalData();
  const { mutate } = useUpdateGlobalSettings();

  const { control, handleSubmit, reset, formState, watch } =
    useForm<GlobalSettings>({
      defaultValues: globalSettings,
      mode: "all",
      resolver: standardSchemaResolver(forms.schemas.globalSettings()),
    });

  const onSubmit = async (values: GlobalSettings) => {
    const { success, data, error } = await mutate(values);
    if (success) {
      reset(data, { keepValues: true });
    } else {
      console.error(error);
      toasts.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "Error saving global settings",
        }),
        error: error,
      });
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
      SETTINGS_AUTOSAVE_INTERVAL,
    );
    return () => clearTimeout(timeoutId);
  }, [formState.isDirty, formState.isValid, setSubmitDisabled]);

  useExitWarning(
    formState.isDirty
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

  const theme = watch("appearance.theme");
  usePreviewTheme(globalSettings.appearance.theme, theme);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} ref={formRef} id={formId}>
      <FullPageTabs
        tabs={[
          {
            title: <FormattedMessage defaultMessage="Inference" />,
            panel: <InferenceSettings control={control} />,
          },
          {
            title: <FormattedMessage defaultMessage="Assistants" />,
            panel: (
              <AssistantsSettings
                control={control}
                developerPrompts={developerPrompts}
              />
            ),
          },
          {
            title: <FormattedMessage defaultMessage="Appearance" />,
            panel: <AppearanceSettings control={control} />,
          },
        ]}
      />
    </Form>
  );
}

function usePreviewTheme(setTheme: Theme, previewTheme: Theme) {
  useEffect(() => {
    applyTheme(previewTheme);
    return () => applyTheme(setTheme);
  }, [setTheme, previewTheme]);
}
