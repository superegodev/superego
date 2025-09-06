import type { GlobalSettings } from "@superego/backend";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function InferenceSettings({ control }: Props) {
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
            name="inference.completions.model"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Model" })}
            placeholder="moonshotai/kimi-k2-instruct-0905"
          />
          <RHFTextField
            control={control}
            name="inference.completions.provider.baseUrl"
            emptyInputValue={null}
            label={intl.formatMessage({
              defaultMessage: "Provider base URL",
            })}
            placeholder="https://api.groq.com/openai/v1/chat/completions"
          />
          <RHFTextField
            control={control}
            name="inference.completions.provider.apiKey"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Provider API key" })}
            placeholder="gsk_XyZ..."
          />
        </Fieldset.Fields>
      </Fieldset>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Transcriptions" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <RHFTextField
            control={control}
            name="inference.transcriptions.model"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Model" })}
            placeholder="whisper-large-v3-turbo"
          />
          <RHFTextField
            control={control}
            name="inference.transcriptions.provider.baseUrl"
            emptyInputValue={null}
            label={intl.formatMessage({
              defaultMessage: "Provider base URL",
            })}
            placeholder="https://api.groq.com/openai/v1/audio/transcriptions"
          />
          <RHFTextField
            control={control}
            name="inference.transcriptions.provider.apiKey"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Provider API key" })}
            placeholder="gsk_XyZ..."
          />
        </Fieldset.Fields>
      </Fieldset>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Completions" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <RHFTextField
            control={control}
            name="inference.speech.model"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Model" })}
            placeholder="playai-tts"
          />
          <RHFTextField
            control={control}
            name="inference.speech.voice"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Voice" })}
            placeholder="Celeste-PlayAI"
          />
          <RHFTextField
            control={control}
            name="inference.speech.provider.baseUrl"
            emptyInputValue={null}
            label={intl.formatMessage({
              defaultMessage: "Provider base URL",
            })}
            placeholder="https://api.groq.com/openai/v1/audio/speech"
          />
          <RHFTextField
            control={control}
            name="inference.speech.provider.apiKey"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Provider API key" })}
            placeholder="gsk_XyZ..."
          />
        </Fieldset.Fields>
      </Fieldset>
    </>
  );
}
