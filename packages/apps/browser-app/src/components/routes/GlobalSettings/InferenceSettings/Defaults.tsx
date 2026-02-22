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

function serializeModelRef(ref: InferenceProviderModelRef): string {
  return `${ref.modelName}@${ref.providerName}`;
}

function deserializeModelRef(id: string): InferenceProviderModelRef {
  const atIndex = id.lastIndexOf("@");
  return {
    modelName: id.slice(0, atIndex),
    providerName: id.slice(atIndex + 1),
  };
}

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function Defaults({ control }: Props) {
  const intl = useIntl();

  const watchedProviders = useWatch({ control, name: "inference.providers" });
  const modelOptions: Option[] = [];
  for (const provider of watchedProviders) {
    for (const model of provider.models) {
      modelOptions.push({
        id: serializeModelRef({
          providerName: provider.name,
          modelName: model.name,
        }),
        label: `${model.name} (${provider.name})`,
      });
    }
  }

  return (
    <Fieldset isDisclosureDisabled={true}>
      <Fieldset.Legend>
        <FormattedMessage defaultMessage="Defaults" />
      </Fieldset.Legend>
      <Fieldset.Fields>
        <DefaultModelSelect
          control={control}
          name="inference.defaults.chat"
          label={intl.formatMessage({ defaultMessage: "Chat" })}
          modelOptions={modelOptions}
        />
        <DefaultModelSelect
          control={control}
          name="inference.defaults.transcription"
          label={intl.formatMessage({ defaultMessage: "Transcription" })}
          modelOptions={modelOptions}
        />
        <DefaultModelSelect
          control={control}
          name="inference.defaults.fileInspection"
          label={intl.formatMessage({ defaultMessage: "File inspection" })}
          modelOptions={modelOptions}
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}

function DefaultModelSelect({
  control,
  name,
  label,
  modelOptions,
}: {
  control: Control<GlobalSettings, any, GlobalSettings>;
  name: `inference.defaults.${"chat" | "transcription" | "fileInspection"}`;
  label: string;
  modelOptions: Option[];
}) {
  const { field, fieldState } = useController({ control, name });

  const value = field.value ? serializeModelRef(field.value) : null;

  return (
    <Select
      id={field.name}
      name={field.name}
      value={value}
      onChange={(key) => {
        field.onChange(key ? deserializeModelRef(key as string) : null);
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
