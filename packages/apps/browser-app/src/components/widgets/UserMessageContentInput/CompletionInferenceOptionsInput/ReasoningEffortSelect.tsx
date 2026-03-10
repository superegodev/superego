import { type InferenceOptions, ReasoningEffort } from "@superego/backend";
import { PiBrain } from "react-icons/pi";
import { useIntl } from "react-intl";
import {
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../../design-system/forms/forms.js";
import * as cs from "./CompletionInferenceOptionsInput.css.js";

interface Props {
  defaultInferenceOptions: InferenceOptions;
  value: InferenceOptions<"completion"> | null;
  onChange: (value: InferenceOptions<"completion">) => void;
  isDisabled: boolean;
}
export default function ReasoningEffortSelect({
  defaultInferenceOptions,
  value,
  onChange,
  isDisabled,
}: Props) {
  const intl = useIntl();

  const reasoningEffortOptions: Option[] = [
    {
      id: ReasoningEffort.None,
      label: intl.formatMessage({ defaultMessage: "None" }),
    },
    {
      id: ReasoningEffort.Low,
      label: intl.formatMessage({ defaultMessage: "Low" }),
    },
    {
      id: ReasoningEffort.Medium,
      label: intl.formatMessage({ defaultMessage: "Medium" }),
    },
    {
      id: ReasoningEffort.High,
      label: intl.formatMessage({ defaultMessage: "High" }),
    },
    {
      id: ReasoningEffort.XHigh,
      label: intl.formatMessage({ defaultMessage: "Extra high" }),
    },
  ];

  const selectedReasoningEffort =
    value?.completion?.reasoningEffort ??
    defaultInferenceOptions.completion?.reasoningEffort ??
    ReasoningEffort.Medium;

  const currentCompletion =
    value?.completion ?? defaultInferenceOptions.completion;

  return (
    <Select
      aria-label={intl.formatMessage({ defaultMessage: "Reasoning effort" })}
      value={selectedReasoningEffort}
      onChange={(optionId) => {
        if (optionId && currentCompletion) {
          onChange({
            completion: {
              providerModelRef: currentCompletion.providerModelRef,
              reasoningEffort: optionId as ReasoningEffort,
            },
            transcription: value?.transcription ?? null,
            fileInspection: value?.fileInspection ?? null,
          });
        }
      }}
      isDisabled={isDisabled}
    >
      <SelectButton
        prefix={<PiBrain />}
        triggerClassName={cs.ReasoningEffortSelect.trigger}
      />
      <SelectOptions
        options={reasoningEffortOptions}
        matchTriggerWidth={false}
      />
    </Select>
  );
}
