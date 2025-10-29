import type { GlobalSettings } from "@superego/backend";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../design-system/Alert/Alert.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./GlobalSettings.css.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function InferenceSettings({ control }: Props) {
  const intl = useIntl();
  return (
    <>
      <Alert variant="info" className={cs.InferenceSettings.info}>
        <FormattedMessage
          defaultMessage={`
            <p>
              To make the assistant work you need to connect it to an
              <b>inference provider</b>—a service that offers APIs for LLMs,
              speech transcription, and speech synthesis. The provider must
              offer APIs <b>compatible with the OpenAI format.</b>
            </p>
            <p>
              Providers known to work:
            </p>
          `}
          values={formattedMessageHtmlTags}
        />
        <ul>
          <li>
            <a
              href="https://groq.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"Groq"}
            </a>
            <FormattedMessage defaultMessage=": fast, cheap, supports all APIs." />
          </li>
          <li>
            <a
              href="https://openai.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"OpenAI"}
            </a>
            <FormattedMessage defaultMessage=": supports all APIs." />
          </li>
          <li>
            <a
              href="https://openrouter.ai/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"OpenRouter"}
            </a>
            <FormattedMessage defaultMessage=": only supports the Chat Completions API." />
          </li>
          <li>
            <a
              href="https://lmstudio.ai/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"LM Studio"}
            </a>
            <FormattedMessage defaultMessage=": app that runs locally on your computer (needs a lot of RAM and a beefy GPU). Only supports the Chat Completions API." />
          </li>
        </ul>
        <FormattedMessage
          defaultMessage={`
            <p>
              Create an account with your chosen provider, get an API key, and
              enter the details below.
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
                  <code>openai/gpt-oss-120b</code>,
                  <code>z-ai/glm-4.6</code>, and
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
            placeholder="https://api.groq.com/openai/v1/chat/completions"
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
          <FormattedMessage defaultMessage="Speech (required for the assistant to speak to you)" />
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
            password={true}
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "Provider API key" })}
            placeholder="gsk_XyZ..."
          />
        </Fieldset.Fields>
      </Fieldset>
    </>
  );
}
