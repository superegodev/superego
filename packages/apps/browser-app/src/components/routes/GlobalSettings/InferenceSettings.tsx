import type { GlobalSettings } from "@superego/backend";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../design-system/Alert/Alert.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import { Fields } from "../../design-system/forms/forms.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./GlobalSettings.css.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function InferenceSettings({ control }: Props) {
  const intl = useIntl();
  return (
    <Fields>
      <Alert variant="info" className={cs.InferenceSettings.info}>
        <FormattedMessage
          defaultMessage={`
            <p>
              To make the assistant work you need to connect it to an
              <b>inference provider</b>. The provider must offer APIs
              <b>compatible with the OpenAI format.</b>
            </p>
          `}
          values={formattedMessageHtmlTags}
        />
      </Alert>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Chat Completions" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <RHFTextField
            control={control}
            name="inference.chatCompletions.model"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Model" })}
            placeholder="openai/gpt-oss-120b"
            description={
              <FormattedMessage
                defaultMessage={`
                  The name of a model supported by the provider you've chosen.
                  You can usually find this in your provider's docs.
                  <code>z-ai/glm-4.7</code>,
                  <code>openai/gpt-oss-120b</code>, and
                  <code>qwen/qwen3-coder</code> generally perform quite well.
                `}
                values={formattedMessageHtmlTags}
              />
            }
          />
          <RHFTextField
            control={control}
            name="inference.chatCompletions.provider.baseUrl"
            emptyInputValue={null}
            label={intl.formatMessage({
              defaultMessage: "Provider base URL",
            })}
            placeholder="https://openrouter.ai/api/v1/chat/completions"
          />
          <RHFTextField
            control={control}
            name="inference.chatCompletions.provider.apiKey"
            password={true}
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Provider API key" })}
            placeholder="gsk_XyZ..."
          />
        </Fieldset.Fields>
      </Fieldset>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Transcriptions (required to speak to the assistant)" />
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
            password={true}
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Provider API key" })}
            placeholder="gsk_XyZ..."
          />
        </Fieldset.Fields>
      </Fieldset>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="File Inspection" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <RHFTextField
            control={control}
            name="inference.fileInspection.model"
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Model" })}
            placeholder="z-ai/glm-4.5v"
            description={
              <FormattedMessage
                defaultMessage={`
                  The name of a multimodal model supporting images, videos, and
                  pdfs.
                `}
                values={formattedMessageHtmlTags}
              />
            }
          />
          <RHFTextField
            control={control}
            name="inference.fileInspection.provider.baseUrl"
            emptyInputValue={null}
            label={intl.formatMessage({
              defaultMessage: "Provider base URL",
            })}
            placeholder="https://openrouter.ai/api/v1/chat/completions"
          />
          <RHFTextField
            control={control}
            name="inference.fileInspection.provider.apiKey"
            password={true}
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Provider API key" })}
            placeholder="gsk_XyZ..."
          />
        </Fieldset.Fields>
      </Fieldset>
    </Fields>
  );
}
