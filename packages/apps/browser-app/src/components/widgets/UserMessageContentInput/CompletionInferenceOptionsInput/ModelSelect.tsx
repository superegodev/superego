import type { InferenceOptions, InferenceSettings } from "@superego/backend";
import { useIntl } from "react-intl";
import ProviderModelRefUtils from "../../../../utils/ProviderModelRefUtils.js";
import {
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../../design-system/forms/forms.js";
import * as cs from "./CompletionInferenceOptionsInput.css.js";

interface Props {
  inferenceSettings: InferenceSettings;
  defaultInferenceOptions: InferenceOptions;
  value: InferenceOptions<"completion"> | null;
  onChange: (value: InferenceOptions<"completion">) => void;
  isDisabled: boolean;
}
export default function ModelSelect({
  inferenceSettings,
  defaultInferenceOptions,
  value,
  onChange,
  isDisabled,
}: Props) {
  const intl = useIntl();

  const modelOptions: Option[] = inferenceSettings.providers.flatMap(
    (provider) =>
      provider.models.map((model) => ({
        id: ProviderModelRefUtils.toString({
          providerName: provider.name,
          modelId: model.id,
        }),
        label: model.name,
        description: provider.name,
      })),
  );

  const selectedModelOptionId = value?.completion
    ? ProviderModelRefUtils.toString(value.completion.providerModelRef)
    : defaultInferenceOptions.completion
      ? ProviderModelRefUtils.toString(
          defaultInferenceOptions.completion.providerModelRef,
        )
      : null;

  const currentCompletion =
    value?.completion ?? defaultInferenceOptions.completion;

  return (
    <Select
      aria-label={intl.formatMessage({ defaultMessage: "Model" })}
      value={selectedModelOptionId}
      onChange={(optionId) => {
        if (optionId && currentCompletion) {
          onChange({
            completion: {
              providerModelRef: ProviderModelRefUtils.fromString(
                optionId as string,
              ),
              reasoningEffort: currentCompletion.reasoningEffort,
            },
            transcription: value?.transcription ?? null,
            fileInspection: value?.fileInspection ?? null,
          });
        }
      }}
      isDisabled={isDisabled}
    >
      <SelectButton triggerClassName={cs.ModelSelect.trigger} />
      <SelectOptions options={modelOptions} matchTriggerWidth={false} />
    </Select>
  );
}
