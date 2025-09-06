import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  AssistantName,
  type GlobalSettings,
  type Theme,
} from "@superego/backend";
import { useEffect, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useUpdateGlobalSettings } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import { SETTINGS_AUTOSAVE_INTERVAL } from "../../../config.js";
import applyTheme from "../../../utils/applyTheme.js";
import FullPageTabs from "../../design-system/FullPageTabs/FullPageTabs.jsx";
import AppearanceSettings from "./AppearanceSettings.jsx";
import AssistantsSettings from "./AssistantsSettings.jsx";
import InferenceSettings from "./InferenceSettings.jsx";

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
      defaultValues: {
        ...globalSettings,
        assistants: {
          developerPrompts: {
            [AssistantName.CollectionManager]:
              globalSettings.assistants.developerPrompts[
                AssistantName.CollectionManager
              ] ?? developerPrompts[AssistantName.CollectionManager],
            [AssistantName.Factotum]:
              globalSettings.assistants.developerPrompts[
                AssistantName.Factotum
              ] ?? developerPrompts[AssistantName.Factotum],
          },
        },
      },
      mode: "all",
      resolver: standardSchemaResolver(forms.schemas.globalSettings()),
    });

  const onSubmit = async (values: GlobalSettings) => {
    const { success, data } = await mutate(values);
    if (success) {
      reset(data);
    } else {
      // TODO: display error in Toast.
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

  const theme = watch("appearance.theme");
  usePreviewTheme(globalSettings.appearance.theme, theme);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} ref={formRef} id={formId}>
      <FullPageTabs
        ariaLabel={intl.formatMessage({ defaultMessage: "Settings" })}
        tabs={[
          {
            title: <FormattedMessage defaultMessage="Inference" />,
            panel: <InferenceSettings control={control} />,
          },
          {
            title: <FormattedMessage defaultMessage="Assistants" />,
            panel: <AssistantsSettings control={control} />,
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
