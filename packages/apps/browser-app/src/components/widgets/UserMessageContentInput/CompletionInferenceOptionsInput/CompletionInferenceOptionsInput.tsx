import type { InferenceOptions, InferenceSettings } from "@superego/backend";
import isEmpty from "../../../../utils/isEmpty.js";
import ModelSelect from "./ModelSelect.js";
import ReasoningEffortSelect from "./ReasoningEffortSelect.js";

interface Props {
  inferenceSettings: InferenceSettings;
  defaultInferenceOptions: InferenceOptions;
  value: InferenceOptions<"completion"> | null;
  onChange: (value: InferenceOptions<"completion">) => void;
  isDisabled: boolean;
}
export default function CompletionInferenceOptionsInput({
  inferenceSettings,
  defaultInferenceOptions,
  value,
  onChange,
  isDisabled,
}: Props) {
  return !isEmpty(inferenceSettings.providers) ? (
    <>
      <ModelSelect
        inferenceSettings={inferenceSettings}
        defaultInferenceOptions={defaultInferenceOptions}
        value={value}
        onChange={onChange}
        isDisabled={isDisabled}
      />
      <ReasoningEffortSelect
        defaultInferenceOptions={defaultInferenceOptions}
        value={value}
        onChange={onChange}
        isDisabled={isDisabled}
      />
    </>
  ) : null;
}
