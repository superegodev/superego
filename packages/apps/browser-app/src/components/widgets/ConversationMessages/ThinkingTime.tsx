import type { GlobalSettings, Message } from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import formatDuration from "../../../utils/formatDuration.js";

interface Props {
  message: Message.ContentAssistant;
}
export default function ThinkingTime({ message }: Props) {
  const intl = useIntl();
  const { globalSettings } = useGlobalData();
  const thinkingTime = message.generationStats.timeTaken;
  const modelName = getModelName(message, globalSettings);
  return thinkingTime > 0 ? (
    <FormattedMessage
      defaultMessage={"{model} thought for {time}"}
      values={{
        model: modelName,
        time: formatDuration(thinkingTime, intl),
      }}
    />
  ) : null;
}

function getModelName(
  message: Message.ContentAssistant,
  globalSettings: GlobalSettings,
): string {
  const { providerModelRef } = message.inferenceOptions.completion;
  const provider = globalSettings.inference.providers.find(
    ({ name }) => name === providerModelRef.providerName,
  );
  return (
    provider?.models.find(({ id }) => id === providerModelRef.modelId)?.name ??
    providerModelRef.modelId
  );
}
