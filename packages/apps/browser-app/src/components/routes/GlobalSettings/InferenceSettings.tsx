import type { GlobalSettings, InferenceModelId } from "@superego/backend";
import {
  type Control,
  type FieldPath,
  useController,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { PiPlus, PiTrash } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../design-system/Alert/Alert.js";
import Button from "../../design-system/Button/Button.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import { Fields, Switch } from "../../design-system/forms/forms.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import RHFSelectField from "../../widgets/RHFSelectField/RHFSelectField.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./GlobalSettings.css.js";

// TODO_AI: refactor, add presets.
interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function InferenceSettings({ control }: Props) {
  const intl = useIntl();

  const providers = useFieldArray({ control, name: "inference.providers" });
  const models = useFieldArray({ control, name: "inference.models" });

  const providerNames = useWatch({ control, name: "inference.providers" }).map(
    (provider) => provider.name,
  );
  const modelOptions = useWatch({ control, name: "inference.models" }).map(
    (model) => ({
      id: model.id,
      label: `${model.name} (${model.providerName})`,
    }),
  );
  const modelOptionsWithNone = [
    { id: "", label: intl.formatMessage({ defaultMessage: "None" }) },
    ...modelOptions,
  ];

  return (
    <Fields>
      <Alert variant="info" className={cs.InferenceSettings.info}>
        <FormattedMessage
          defaultMessage={`
            <p>
              To make the assistant work you need to connect it to an
              <b>inference provider</b>. The provider must offer APIs
              <b>compatible with the OpenAI format.</b>
            </p>
          `}
          values={formattedMessageHtmlTags}
        />
      </Alert>

      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Providers" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          {providers.fields.map((field, index) => (
            <Fieldset key={field.id}>
              <Fieldset.Legend>
                <FormattedMessage
                  defaultMessage="Provider {index}"
                  values={{ index: index + 1 }}
                />
                <IconButton
                  label={intl.formatMessage({ defaultMessage: "Remove" })}
                  variant="invisible"
                  onPress={() => providers.remove(index)}
                >
                  <PiTrash />
                </IconButton>
              </Fieldset.Legend>
              <Fieldset.Fields>
                <RHFTextField
                  control={control}
                  name={`inference.providers.${index}.name`}
                  label={intl.formatMessage({ defaultMessage: "Name" })}
                  placeholder="openrouter"
                />
                <RHFTextField
                  control={control}
                  name={`inference.providers.${index}.baseUrl`}
                  label={intl.formatMessage({ defaultMessage: "Base URL" })}
                  placeholder="https://openrouter.ai/api/v1/chat/completions"
                />
                <RHFTextField
                  control={control}
                  name={`inference.providers.${index}.apiKey`}
                  password={true}
                  emptyInputValue={null}
                  label={intl.formatMessage({ defaultMessage: "API key" })}
                  placeholder="sk-..."
                />
              </Fieldset.Fields>
            </Fieldset>
          ))}
          <Button
            onPress={() =>
              providers.append({ name: "", baseUrl: "", apiKey: null })
            }
          >
            <PiPlus />
            <FormattedMessage defaultMessage="Add provider" />
          </Button>
        </Fieldset.Fields>
      </Fieldset>

      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Models" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          {models.fields.map((field, index) => (
            <Fieldset key={field.id}>
              <Fieldset.Legend>
                <FormattedMessage
                  defaultMessage="Model {index}"
                  values={{ index: index + 1 }}
                />
                <IconButton
                  label={intl.formatMessage({ defaultMessage: "Remove" })}
                  variant="invisible"
                  onPress={() => models.remove(index)}
                >
                  <PiTrash />
                </IconButton>
              </Fieldset.Legend>
              <Fieldset.Fields>
                <RHFTextField
                  control={control}
                  name={`inference.models.${index}.name`}
                  label={intl.formatMessage({ defaultMessage: "Name" })}
                  placeholder="openai/gpt-oss-120b"
                />
                <RHFSelectField
                  control={control}
                  name={`inference.models.${index}.providerName`}
                  options={providerNames.map((name) => ({
                    id: name,
                    label: name,
                  }))}
                  label={intl.formatMessage({ defaultMessage: "Provider" })}
                  placeholder={intl.formatMessage({
                    defaultMessage: "Select a provider",
                  })}
                />
                <ModelCapabilities control={control} index={index} />
              </Fieldset.Fields>
            </Fieldset>
          ))}
          <Button
            onPress={() =>
              models.append({
                id: "" as InferenceModelId,
                name: "",
                providerName: "",
                capabilities: {
                  reasoning: false,
                  audioUnderstanding: false,
                  imageUnderstanding: false,
                  pdfUnderstanding: false,
                  webSearching: false,
                },
              })
            }
          >
            <PiPlus />
            <FormattedMessage defaultMessage="Add model" />
          </Button>
        </Fieldset.Fields>
      </Fieldset>

      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Default models" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <RHFSelectField
            control={control}
            name="inference.defaultChatModel"
            options={modelOptionsWithNone}
            label={intl.formatMessage({ defaultMessage: "Chat" })}
          />
          <RHFSelectField
            control={control}
            name="inference.defaultTranscriptionModel"
            options={modelOptionsWithNone}
            label={intl.formatMessage({ defaultMessage: "Transcription" })}
          />
          <RHFSelectField
            control={control}
            name="inference.defaultFileInspectionModel"
            options={modelOptionsWithNone}
            label={intl.formatMessage({ defaultMessage: "File inspection" })}
          />
        </Fieldset.Fields>
      </Fieldset>
    </Fields>
  );
}

function ModelCapabilities({
  control,
  index,
}: {
  control: Control<GlobalSettings, any, GlobalSettings>;
  index: number;
}) {
  const intl = useIntl();
  const prefix = `inference.models.${index}.capabilities` as const;
  return (
    <Fieldset>
      <Fieldset.Legend>
        <FormattedMessage defaultMessage="Capabilities" />
      </Fieldset.Legend>
      <Fieldset.Fields>
        <CapabilitySwitch
          control={control}
          name={`${prefix}.reasoning`}
          label={intl.formatMessage({ defaultMessage: "Reasoning" })}
        />
        <CapabilitySwitch
          control={control}
          name={`${prefix}.audioUnderstanding`}
          label={intl.formatMessage({
            defaultMessage: "Audio understanding",
          })}
        />
        <CapabilitySwitch
          control={control}
          name={`${prefix}.imageUnderstanding`}
          label={intl.formatMessage({
            defaultMessage: "Image understanding",
          })}
        />
        <CapabilitySwitch
          control={control}
          name={`${prefix}.pdfUnderstanding`}
          label={intl.formatMessage({ defaultMessage: "PDF understanding" })}
        />
        <CapabilitySwitch
          control={control}
          name={`${prefix}.webSearching`}
          label={intl.formatMessage({ defaultMessage: "Web searching" })}
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}

function CapabilitySwitch({
  control,
  name,
  label,
}: {
  control: Control<GlobalSettings, any, GlobalSettings>;
  name: FieldPath<GlobalSettings>;
  label: string;
}) {
  const { field } = useController({ control, name });
  return (
    <Switch isSelected={field.value as boolean} onChange={field.onChange}>
      {label}
    </Switch>
  );
}
