import type {
  InferenceOptions,
  InferenceProviderModelRef,
  InferenceSettings,
} from "@superego/backend";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import {
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../design-system/forms/forms.js";
import * as cs from "./UserMessageContentInput.css.js";

interface Props {
  inference: InferenceSettings;
  value: InferenceOptions | null;
  onChange: (value: InferenceOptions) => void;
  isDisabled: boolean;
}
export default function InferenceOptionsInput({
  inference,
  value,
  onChange,
  isDisabled,
}: Props) {
  const intl = useIntl();

  const modelOptions: Option[] = useMemo(() => {
    const options: Option[] = [];
    for (const provider of inference.providers) {
      for (const model of provider.models) {
        options.push({
          id: serializeModelRef({
            providerName: provider.name,
            modelId: model.id,
          }),
          label: model.name,
          description: provider.name,
        });
      }
    }
    return options;
  }, [inference.providers]);

  if (modelOptions.length === 0) {
    return null;
  }

  const selectedKey = value ? serializeModelRef(value.providerModelRef) : null;

  return (
    <Select
      aria-label={intl.formatMessage({ defaultMessage: "Model" })}
      value={selectedKey}
      onChange={(key) => {
        if (key) {
          onChange({ providerModelRef: deserializeModelRef(key as string) });
        }
      }}
      isDisabled={isDisabled}
    >
      <SelectButton
        triggerClassName={cs.InferenceOptionsInput.selectModelTrigger}
      />
      <SelectOptions options={modelOptions} matchTriggerWidth={false} />
    </Select>
  );
}

function serializeModelRef(ref: InferenceProviderModelRef): string {
  return `${ref.modelId}@${ref.providerName}`;
}

function deserializeModelRef(id: string): InferenceProviderModelRef {
  const atIndex = id.lastIndexOf("@");
  return {
    modelId: id.slice(0, atIndex),
    providerName: id.slice(atIndex + 1),
  };
}
