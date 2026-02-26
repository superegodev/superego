import {
  type GlobalSettings,
  InferenceProviderDriver,
} from "@superego/backend";
import { type Control, useFieldArray } from "react-hook-form";
import { PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "../../../design-system/Button/Button.jsx";
import Fieldset from "../../../design-system/Fieldset/Fieldset.js";
import Fields from "../../../design-system/forms/Fields.jsx";
import RHFSelectField from "../../../widgets/RHFSelectField/RHFSelectField.js";
import RHFTextField from "../../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./InferenceSettings.css.js";
import Model from "./Model.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
  name: `inference.providers.${number}`;
  onRemove: () => void;
}
export default function Provider({ control, name, onRemove }: Props) {
  const intl = useIntl();
  const models = useFieldArray({ control, name: `${name}.models` });

  return (
    <section className={cs.Provider.root}>
      <Fields>
        <div className={cs.Provider.providerRow}>
          <RHFTextField
            control={control}
            name={`${name}.name`}
            label={intl.formatMessage({ defaultMessage: "Name" })}
            placeholder="openrouter"
          />
          <RHFSelectField
            control={control}
            name={`${name}.driver`}
            options={Object.values(InferenceProviderDriver).map((driver) => ({
              id: driver,
              label: driver,
            }))}
            label={intl.formatMessage({ defaultMessage: "Driver" })}
          />
        </div>
        <div className={cs.Provider.providerRow}>
          <RHFTextField
            control={control}
            name={`${name}.baseUrl`}
            label={intl.formatMessage({ defaultMessage: "Base URL" })}
            placeholder="https://openrouter.ai/api/v1/responses"
          />
          <RHFTextField
            control={control}
            name={`${name}.apiKey`}
            password={true}
            emptyInputValue={null}
            label={intl.formatMessage({ defaultMessage: "API key" })}
            placeholder="sk-..."
          />
        </div>

        <Fieldset isDisclosureDisabled={true}>
          <Fieldset.Legend>
            <FormattedMessage defaultMessage="Models" />
          </Fieldset.Legend>
          <Fieldset.Fields className={cs.Provider.modelsFields}>
            {models.fields.map((field, modelIndex) => (
              <Model
                key={field.id}
                control={control}
                name={`${name}.models.${modelIndex}`}
                index={modelIndex}
                onRemove={() => models.remove(modelIndex)}
              />
            ))}
            <Button
              className={cs.Provider.addButton}
              onPress={() =>
                models.append({
                  id: "",
                  name: "",
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
        <Button variant="danger" onPress={onRemove}>
          <FormattedMessage defaultMessage="Remove" />
        </Button>
      </Fields>
    </section>
  );
}
