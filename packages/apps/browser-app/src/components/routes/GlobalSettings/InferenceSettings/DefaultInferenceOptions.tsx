import type {
  GlobalSettings,
  InferenceProviderModelRef,
} from "@superego/backend";
import { type Control, useController, useWatch } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import Fieldset from "../../../design-system/Fieldset/Fieldset.js";
import {
  FieldError,
  Label,
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../../design-system/forms/forms.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function DefaultInferenceOptions({ control }: Props) {
  const intl = useIntl();

  const providers = useWatch({ control, name: "inference.providers" });
  const modelOptions: Option[] = [];
  for (const provider of providers) {
    for (const model of provider.models) {
      modelOptions.push({
        id: serializeProviderModelRef({
          providerName: provider.name,
          modelId: model.id,
        }),
        label: model.name,
        description: provider.name,
      });
    }
  }

  return (
    <Fieldset isDisclosureDisabled={true}>
      <Fieldset.Legend>
        <FormattedMessage defaultMessage="Default inference options" />
      </Fieldset.Legend>
      <Fieldset.Fields>
        <DefaultModelSelect
          control={control}
          name="inference.defaultInferenceOptions.completion"
          label={intl.formatMessage({ defaultMessage: "Completion model" })}
          modelOptions={modelOptions}
        />
        <DefaultModelSelect
          control={control}
          name="inference.defaultInferenceOptions.transcription"
          label={intl.formatMessage({ defaultMessage: "Transcription model" })}
          modelOptions={modelOptions}
        />
        <DefaultModelSelect
          control={control}
          name="inference.defaultInferenceOptions.fileInspection"
          label={intl.formatMessage({
            defaultMessage: "File inspection model",
          })}
          modelOptions={modelOptions}
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}

interface DefaultModelSelectProps {
  control: Control<GlobalSettings, any, GlobalSettings>;
  name: `inference.defaultInferenceOptions.${"completion" | "transcription" | "fileInspection"}`;
  label: string;
  modelOptions: Option[];
}
function DefaultModelSelect({
  control,
  name,
  label,
  modelOptions,
}: DefaultModelSelectProps) {
  const { field, fieldState } = useController({ control, name });

  const selectedOptionId = field.value
    ? serializeProviderModelRef(field.value.providerModelRef)
    : null;

  return (
    <Select
      id={field.name}
      name={field.name}
      value={selectedOptionId}
      onChange={(optionId) => {
        field.onChange(
          optionId
            ? {
                providerModelRef: deserializeProviderModelRef(
                  optionId as string,
                ),
              }
            : null,
        );
      }}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
    >
      <Label>{label}</Label>
      <SelectButton
        onClear={field.value ? () => field.onChange(null) : undefined}
      />
      <FieldError>{fieldState.error?.message}</FieldError>
      <SelectOptions options={modelOptions} />
    </Select>
  );
}

function serializeProviderModelRef(
  providerModelRef: InferenceProviderModelRef,
): string {
  return JSON.stringify(providerModelRef);
}

function deserializeProviderModelRef(id: string): InferenceProviderModelRef {
  return JSON.parse(id);
}
