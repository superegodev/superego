import { type GlobalSettings, ReasoningEffort } from "@superego/backend";
import { type Control, useController } from "react-hook-form";
import last from "../../../../../utils/last.js";
import ProviderModelRefUtils from "../../../../../utils/ProviderModelRefUtils.js";
import {
  FieldError,
  Label,
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../../../design-system/forms/forms.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
  name: `inference.defaultInferenceOptions.${"completion" | "transcription" | "fileInspection"}`;
  label: string;
  modelOptions: Option[];
}
export default function ModelSelect({
  control,
  name,
  label,
  modelOptions,
}: Props) {
  const { field: sectionField, formState } = useController({ control, name });

  const section = last(name.split(".")) as
    | "completion"
    | "transcription"
    | "fileInspection";

  const providerModelRef = sectionField.value?.providerModelRef ?? null;
  const selectedOptionId = providerModelRef
    ? ProviderModelRefUtils.toString(providerModelRef)
    : null;

  // Read the providerModelRef error from formState without a separate
  // controller, since registering a controller at the providerModelRef path
  // causes validation errors when the section is null.
  const providerModelRefError = (formState.errors as any)?.inference
    ?.defaultInferenceOptions?.[section]?.providerModelRef as
    | { message?: string }
    | undefined;

  return (
    <Select
      name={`${sectionField.name}.providerModelRef`}
      value={selectedOptionId}
      onChange={(optionId) => {
        if (optionId) {
          const currentValue = sectionField.value as
            | Record<string, unknown>
            | null
            | undefined;
          const newValue: Record<string, unknown> = {
            ...currentValue,
            providerModelRef: ProviderModelRefUtils.fromString(
              optionId as string,
            ),
          };
          if (section === "completion" && !currentValue?.["reasoningEffort"]) {
            newValue["reasoningEffort"] = ReasoningEffort.Medium;
          }
          sectionField.onChange(newValue);
        } else {
          sectionField.onChange(null);
        }
      }}
      validationBehavior="aria"
      isInvalid={!!providerModelRefError}
    >
      <Label>{label}</Label>
      <SelectButton
        onClear={
          providerModelRef ? () => sectionField.onChange(null) : undefined
        }
      />
      <FieldError>{providerModelRefError?.message}</FieldError>
      <SelectOptions options={modelOptions} />
    </Select>
  );
}
