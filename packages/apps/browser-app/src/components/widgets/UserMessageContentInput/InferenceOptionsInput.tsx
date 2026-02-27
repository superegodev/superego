import type {
  InferenceOptions,
  InferenceProviderModelRef,
  InferenceSettings,
} from "@superego/backend";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import isEmpty from "../../../utils/isEmpty.js";
import {
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../design-system/forms/forms.js";
import * as cs from "./UserMessageContentInput.css.js";

// TODO_AI: for now the component only has the model selector. Refactor once
// more options are supported.
interface Props {
  inferenceSettings: InferenceSettings;
  defaultInferenceOptions: InferenceOptions;
  value: InferenceOptions<"completion"> | null;
  onChange: (value: InferenceOptions<"completion">) => void;
  isDisabled: boolean;
}
export default function InferenceOptionsInput({
  inferenceSettings,
  defaultInferenceOptions,
  value,
  onChange,
  isDisabled,
}: Props) {
  const intl = useIntl();

  const modelOptions: Option[] = useMemo(() => {
    const options: Option[] = [];
    for (const provider of inferenceSettings.providers) {
      for (const model of provider.models) {
        options.push({
          id: serializeProviderModelRef({
            providerName: provider.name,
            modelId: model.id,
          }),
          label: model.name,
          description: provider.name,
        });
      }
    }
    return options;
  }, [inferenceSettings.providers]);

  const selectedOptionId = value?.completion
    ? serializeProviderModelRef(value.completion.providerModelRef)
    : defaultInferenceOptions.completion
      ? serializeProviderModelRef(
          defaultInferenceOptions.completion.providerModelRef,
        )
      : null;

  return !isEmpty(modelOptions) ? (
    <Select
      aria-label={intl.formatMessage({ defaultMessage: "Model" })}
      value={selectedOptionId}
      onChange={(optionId) => {
        if (optionId) {
          onChange({
            completion: {
              providerModelRef: deserializeProviderModelRef(optionId as string),
            },
            transcription: value?.transcription ?? null,
            fileInspection: value?.fileInspection ?? null,
          });
        }
      }}
      isDisabled={isDisabled}
    >
      <SelectButton
        triggerClassName={cs.InferenceOptionsInput.selectModelTrigger}
      />
      <SelectOptions options={modelOptions} matchTriggerWidth={false} />
    </Select>
  ) : null;
}

function serializeProviderModelRef(
  providerModelRef: InferenceProviderModelRef,
): string {
  return JSON.stringify(providerModelRef);
}

function deserializeProviderModelRef(
  optionId: string,
): InferenceProviderModelRef {
  return JSON.parse(optionId);
}
