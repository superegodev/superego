import type { GlobalSettings } from "@superego/backend";
import type { Control } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import Fields from "../../../design-system/forms/Fields.js";
import DefaultInferenceOptions from "./DefaultInferenceOptions.js";
import * as cs from "./InferenceSettings.css.js";
import Providers from "./Providers.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function InferenceSettings({ control }: Props) {
  return (
    <Fields>
      <p className={cs.InferenceSettings.info}>
        <FormattedMessage
          defaultMessage={`
            Configure an <b>inference provider</b> to enable the assistant. A
            model with audio understanding capabilities is necessary for the
            "speak" feature.
          `}
          values={formattedMessageHtmlTags}
        />
      </p>
      <Providers control={control} />
      <DefaultInferenceOptions control={control} />
    </Fields>
  );
}
