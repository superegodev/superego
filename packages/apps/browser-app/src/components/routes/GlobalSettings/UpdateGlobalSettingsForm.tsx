import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { CompletionModel, type GlobalSettings, Theme } from "@superego/backend";
import { useEffect } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useUpdateGlobalSettings } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import AIModelUtils from "../../../utils/AIModelUtils.js";
import applyTheme from "../../../utils/applyTheme.js";
import Alert from "../../design-system/Alert/Alert.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.jsx";
import RpcError from "../../design-system/RpcError/RpcError.js";
import Section from "../../design-system/Section/Section.jsx";
import RHFSelectField from "../../widgets/RHFSelectField/RHFSelectField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.jsx";
import * as cs from "./GlobalSettings.css.js";

export default function UpdateGlobalSettingsForm() {
  const intl = useIntl();

  const { globalSettings } = useGlobalData();
  const { result, mutate } = useUpdateGlobalSettings();

  const { control, handleSubmit, reset, watch } = useForm<GlobalSettings>({
    defaultValues: globalSettings,
    mode: "all",
    resolver: standardSchemaResolver(forms.schemas.globalSettings()),
  });

  const onSubmit = async (values: GlobalSettings) => {
    const { success, data } = await mutate(values);
    if (success) {
      reset(data);
    }
  };

  const theme = watch("appearance.theme");
  usePreviewTheme(globalSettings.appearance.theme, theme);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Section
        title={intl.formatMessage({ defaultMessage: "Appearance" })}
        level={2}
      >
        <RHFSelectField
          control={control}
          name="appearance.theme"
          options={Object.values(Theme).map((theme) => ({
            id: theme,
            label: theme,
          }))}
          label={intl.formatMessage({ defaultMessage: "Theme" })}
        />
      </Section>
      <Section
        title={intl.formatMessage({ defaultMessage: "Inference" })}
        level={2}
      >
        <Section
          title={intl.formatMessage({ defaultMessage: "Providers" })}
          level={3}
        >
          <Fieldset isDisclosureDisabled={true}>
            <Fieldset.Legend>
              <FormattedMessage defaultMessage="Groq" />
            </Fieldset.Legend>
            <Fieldset.Fields>
              <RHFTextField
                control={control}
                name="inference.providers.groq.apiKey"
                emptyInputValue={null}
                label={intl.formatMessage({ defaultMessage: "API key" })}
              />
              <RHFTextField
                control={control}
                name="inference.providers.groq.baseUrl"
                emptyInputValue={null}
                label={intl.formatMessage({ defaultMessage: "Base URL" })}
              />
            </Fieldset.Fields>
          </Fieldset>
        </Section>
        <Section
          title={intl.formatMessage({ defaultMessage: "Completions" })}
          level={3}
        >
          <RHFSelectField
            control={control}
            name="inference.completions.defaultModel"
            options={Object.values(CompletionModel).map((CompletionModel) => ({
              id: CompletionModel,
              label: AIModelUtils.getDisplayName(CompletionModel),
            }))}
            label={intl.formatMessage({ defaultMessage: "Default model" })}
          />
        </Section>
      </Section>
      <div className={cs.UpdateGlobalSettingsForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Save settings" />
        </RHFSubmitButton>
      </div>
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error saving settings",
          })}
        >
          <RpcError error={result.error} />
        </Alert>
      ) : null}
    </Form>
  );
}

function usePreviewTheme(setTheme: Theme, previewTheme: Theme) {
  useEffect(() => {
    applyTheme(previewTheme);
    return () => applyTheme(setTheme);
  }, [setTheme, previewTheme]);
}
