import type { GlobalSettings } from "@superego/backend";
import type { ReactNode } from "react";
import { type Control, type FieldPath, useController } from "react-hook-form";
import {
  PiBrain,
  PiFilePdf,
  PiGlobe,
  PiImage,
  PiMicrophone,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import IconToggleButton from "../../../design-system/IconToggleButton/IconToggleButton.js";
import * as cs from "./InferenceSettings.css.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
  name: `inference.providers.${number}.models.${number}`;
}
export default function Capabilities({ control, name }: Props) {
  const intl = useIntl();
  const prefix = `${name}.capabilities` as const;
  return (
    <div className={cs.Capabilities.root}>
      <CapabilityToggle
        control={control}
        name={`${prefix}.reasoning`}
        label={intl.formatMessage({
          defaultMessage: "Supports reasoning",
        })}
        icon={<PiBrain />}
      />
      <CapabilityToggle
        control={control}
        name={`${prefix}.audioUnderstanding`}
        label={intl.formatMessage({
          defaultMessage: "Supports audio understanding",
        })}
        icon={<PiMicrophone />}
      />
      <CapabilityToggle
        control={control}
        name={`${prefix}.imageUnderstanding`}
        label={intl.formatMessage({
          defaultMessage: "Supports image understanding",
        })}
        icon={<PiImage />}
      />
      <CapabilityToggle
        control={control}
        name={`${prefix}.pdfUnderstanding`}
        label={intl.formatMessage({
          defaultMessage: "Supports PDF understanding",
        })}
        icon={<PiFilePdf />}
      />
      <CapabilityToggle
        control={control}
        name={`${prefix}.webSearching`}
        label={intl.formatMessage({
          defaultMessage: "Supports web searching",
        })}
        icon={<PiGlobe />}
      />
    </div>
  );
}

function CapabilityToggle({
  control,
  name,
  label,
  icon,
}: {
  control: Control<GlobalSettings, any, GlobalSettings>;
  name: FieldPath<GlobalSettings>;
  label: string;
  icon: ReactNode;
}) {
  const { field } = useController({ control, name });
  return (
    <IconToggleButton
      label={label}
      className={cs.Capabilities.button}
      isSelected={field.value as boolean}
      onChange={field.onChange}
    >
      {icon}
    </IconToggleButton>
  );
}
