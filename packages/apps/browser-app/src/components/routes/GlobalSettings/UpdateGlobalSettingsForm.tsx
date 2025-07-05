import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { type GlobalSettings, Theme } from "@superego/backend";
import { useEffect } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useUpdateGlobalSettings } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import applyTheme from "../../../utils/applyTheme.js";
import Alert from "../../design-system/Alert/Alert.js";
import RpcError from "../../design-system/RpcError/RpcError.js";
import RHFSelectField from "../../widgets/RHFSelectField/RHFSelectField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
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

  const theme = watch("theme");
  usePreviewTheme(globalSettings.theme, theme);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <RHFSelectField
        control={control}
        name="theme"
        options={Object.values(Theme).map((theme) => ({
          id: theme,
          label: theme,
        }))}
        autoFocus={true}
        label={intl.formatMessage({ defaultMessage: "Theme" })}
      />
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
