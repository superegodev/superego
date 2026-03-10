import type { GlobalSettings, InferenceModel } from "@superego/backend";
import {
  type Control,
  type UseFormTrigger,
  useController,
} from "react-hook-form";
import { PiFilePdf, PiImage, PiMicrophone } from "react-icons/pi";
import { useIntl } from "react-intl";
import IconToggleButton from "../../../design-system/IconToggleButton/IconToggleButton.js";
import * as cs from "./InferenceSettings.css.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
  triggerValidation: UseFormTrigger<GlobalSettings>;
  name: `inference.providers.${number}.models.${number}.capabilities`;
}
export default function Capabilities({
  control,
  triggerValidation,
  name,
}: Props) {
  const intl = useIntl();

  const { field } = useController({ control, name });

  const capabilities = field.value as InferenceModel["capabilities"];

  const toggle = (key: keyof InferenceModel["capabilities"]) => {
    field.onChange({ ...capabilities, [key]: !capabilities[key] });
    triggerValidation("inference.defaultInferenceOptions");
  };

  return (
    <div className={cs.Capabilities.root}>
      <IconToggleButton
        label={intl.formatMessage({
          defaultMessage: "Supports audio understanding",
        })}
        className={cs.Capabilities.button}
        isSelected={capabilities.audioUnderstanding}
        onChange={() => toggle("audioUnderstanding")}
      >
        <PiMicrophone />
      </IconToggleButton>
      <IconToggleButton
        label={intl.formatMessage({
          defaultMessage: "Supports image understanding",
        })}
        className={cs.Capabilities.button}
        isSelected={capabilities.imageUnderstanding}
        onChange={() => toggle("imageUnderstanding")}
      >
        <PiImage />
      </IconToggleButton>
      <IconToggleButton
        label={intl.formatMessage({
          defaultMessage: "Supports PDF understanding",
        })}
        className={cs.Capabilities.button}
        isSelected={capabilities.pdfUnderstanding}
        onChange={() => toggle("pdfUnderstanding")}
      >
        <PiFilePdf />
      </IconToggleButton>
    </div>
  );
}
