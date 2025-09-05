import type { GlobalSettings } from "@superego/backend";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function AssistantSettings({ control }: Props) {
  const intl = useIntl();
  return (
    <>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Completions" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <RHFTextField
            control={control}
            name="assistant.completions.model"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Model" })}
            placeholder="moonshotai/kimi-k2-instruct-0905"
          />
          <RHFTextField
            control={control}
            name="assistant.completions.provider.baseUrl"
            emptyInputValue={null}
            label={intl.formatMessage({
              defaultMessage: "Provider base URL",
            })}
            placeholder="https://api.groq.com/openai/v1/chat/completions"
          />
          <RHFTextField
            control={control}
            name="assistant.completions.provider.apiKey"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Provider API key" })}
            placeholder="gsk_XyZ..."
          />
        </Fieldset.Fields>
      </Fieldset>
      <RHFTextField
        control={control}
        name="assistant.developerPrompt"
        emptyInputValue={null}
        textArea={true}
        label={intl.formatMessage({ defaultMessage: "Developer prompt" })}
      />
    </>
  );
}
