import type { GlobalSettings, Message } from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import formatDuration from "../../../../utils/formatDuration.js";
import type AggregatedGenerationStats from "./AggregatedGenerationStats.js";

interface Props {
  generationStats: AggregatedGenerationStats;
  message: Message.ContentAssistant;
}
export default function ThinkingTime({ generationStats, message }: Props) {
  const intl = useIntl();
  const { globalSettings } = useGlobalData();
  const modelName = getModelName(message, globalSettings);
  return generationStats.timeTaken > 0 ? (
    <FormattedMessage
      defaultMessage={"{model} thought for {time}"}
      values={{
        model: modelName,
        time: formatDuration(generationStats.timeTaken, intl),
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
