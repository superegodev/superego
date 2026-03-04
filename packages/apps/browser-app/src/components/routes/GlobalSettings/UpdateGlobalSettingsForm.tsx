import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { GlobalSettings, Theme } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useUpdateGlobalSettings } from "../../../business-logic/backend/hooks.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import { SETTINGS_AUTOSAVE_INTERVAL } from "../../../config.js";
import applyTheme from "../../../utils/applyTheme.js";
import FullPageTabs from "../../design-system/FullPageTabs/FullPageTabs.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
import AppearanceSettings from "./AppearanceSettings.js";
import AssistantsSettings from "./AssistantsSettings.js";
import InferenceSettings from "./InferenceSettings/InferenceSettings.js";

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

  const { control, handleSubmit, reset, watch, trigger } =
    useForm<GlobalSettings>({
      defaultValues: globalSettings,
      mode: "onBlur",
      resolver: standardSchemaResolver(valibotSchemas.globalSettings()),
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

  const formRef = useRef<HTMLFormElement>(null);

  const theme = watch("appearance.theme");
  usePreviewTheme(globalSettings.appearance.theme, theme);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} ref={formRef} id={formId}>
      <FormStateEffects
        control={control}
        formRef={formRef}
        autosaveInterval={SETTINGS_AUTOSAVE_INTERVAL}
        setSubmitDisabled={setSubmitDisabled}
        triggerExitWarningWhenDirty={true}
      />
      <FullPageTabs
        tabs={[
          {
            title: <FormattedMessage defaultMessage="Inference" />,
            panel: (
              <InferenceSettings
                control={control}
                triggerValidation={trigger}
              />
            ),
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
