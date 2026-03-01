import { type GlobalSettings, ReasoningEffort } from "@superego/backend";
import { type Control, useController } from "react-hook-form";
import { useIntl } from "react-intl";
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
  name: "inference.defaultInferenceOptions.completion";
  label: string;
}
export default function ReasoningEffortSelect({ control, name, label }: Props) {
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

  const { field, formState } = useController({ control, name });

  const reasoningEffortError = (formState.errors as any)?.inference
    ?.defaultInferenceOptions?.completion?.reasoningEffort as
    | { message?: string }
    | undefined;

  return (
    <Select
      name={`${field.name}.reasoningEffort`}
      value={field.value?.reasoningEffort ?? null}
      onChange={(optionId) => {
        if (optionId) {
          field.onChange({
            ...field.value,
            reasoningEffort: optionId as ReasoningEffort,
          });
        }
      }}
      validationBehavior="aria"
      isInvalid={!!reasoningEffortError}
      isDisabled={!field.value}
    >
      <Label>{label}</Label>
      <SelectButton />
      <FieldError>{reasoningEffortError?.message}</FieldError>
      <SelectOptions options={reasoningEffortOptions} />
    </Select>
  );
}
