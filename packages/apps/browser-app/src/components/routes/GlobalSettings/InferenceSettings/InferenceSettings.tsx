import {
  type GlobalSettings,
  InferenceProviderDriver,
} from "@superego/backend";
import { type Control, useFieldArray } from "react-hook-form";
import { PiPlus } from "react-icons/pi";
import { FormattedMessage } from "react-intl";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import Button from "../../../design-system/Button/Button.js";
import Fieldset from "../../../design-system/Fieldset/Fieldset.js";
import Defaults from "./Defaults.js";
import * as cs from "./InferenceSettings.css.js";
import Provider from "./Provider.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function InferenceSettings({ control }: Props) {
  const providers = useFieldArray({ control, name: "inference.providers" });

  return (
    <>
      <p className={cs.InferenceSettings.info}>
        <FormattedMessage
          defaultMessage={`
            To make the assistant work you need to connect it to an
            <b>inference provider</b>. The provider must offer APIs
            <b>compatible with the OpenAI format.</b>
          `}
          values={formattedMessageHtmlTags}
        />
      </p>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Providers" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          {providers.fields.map((field, index) => (
            <Provider
              key={field.id}
              control={control}
              name={`inference.providers.${index}`}
              onRemove={() => providers.remove(index)}
            />
          ))}
          <Button
            className={cs.InferenceSettings.addButton}
            onPress={() =>
              providers.append({
                name: "",
                baseUrl: "",
                apiKey: null,
                driver: InferenceProviderDriver.OpenRouter,
                models: [],
              })
            }
          >
            <PiPlus />
            <FormattedMessage defaultMessage="Add provider" />
          </Button>
        </Fieldset.Fields>
      </Fieldset>
      <Defaults control={control} />
    </>
  );
}
