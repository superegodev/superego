import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { GlobalSettings, Theme } from "@superego/backend";
import { useEffect, useId, useRef } from "react";
import { Form, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useUpdateGlobalSettings } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import { SETTINGS_AUTOSAVE_INTERVAL } from "../../../config.js";
import applyTheme from "../../../utils/applyTheme.js";
import AppearanceSettings from "./AppearanceSettings.jsx";
import AssistantSettings from "./AssistantSettings.js";
import * as cs from "./GlobalSettings.css.js";

interface Props {
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
}
export default function UpdateGlobalSettingsForm({
  formId,
  setSubmitDisabled,
}: Props) {
  const intl = useIntl();

  const { globalSettings } = useGlobalData();
  const { mutate } = useUpdateGlobalSettings();

  const { control, handleSubmit, reset, formState, watch } =
    useForm<GlobalSettings>({
      defaultValues: globalSettings,
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

  const appearanceTabId = useId();
  const assistantTabId = useId();

  const theme = watch("appearance.theme");
  usePreviewTheme(globalSettings.appearance.theme, theme);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} ref={formRef} id={formId}>
      <Tabs>
        <TabList
          aria-label={intl.formatMessage({ defaultMessage: "Settings" })}
          className={cs.UpdateGlobalSettingsForm.tabList}
        >
          <Tab id={assistantTabId} className={cs.UpdateGlobalSettingsForm.tab}>
            <FormattedMessage defaultMessage="Assistant" />
          </Tab>
          <Tab id={appearanceTabId} className={cs.UpdateGlobalSettingsForm.tab}>
            <FormattedMessage defaultMessage="Appearance" />
          </Tab>
        </TabList>
        <TabPanel
          id={assistantTabId}
          className={cs.UpdateGlobalSettingsForm.tabPanel}
        >
          <AssistantSettings control={control} />
        </TabPanel>
        <TabPanel
          id={appearanceTabId}
          className={cs.UpdateGlobalSettingsForm.tabPanel}
        >
          <AppearanceSettings control={control} />
        </TabPanel>
      </Tabs>
    </Form>
  );
}

function usePreviewTheme(setTheme: Theme, previewTheme: Theme) {
  useEffect(() => {
    applyTheme(previewTheme);
    return () => applyTheme(setTheme);
  }, [setTheme, previewTheme]);
}
