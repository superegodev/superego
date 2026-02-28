import type { GlobalSettings } from "@superego/backend";
import type { Control } from "react-hook-form";
import { PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import IconButton from "../../../design-system/IconButton/IconButton.js";
import RHFTextField from "../../../widgets/RHFTextField/RHFTextField.js";
import Capabilities from "./Capabilities.js";
import * as cs from "./InferenceSettings.css.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
  name: `inference.providers.${number}.models.${number}`;
  onRemove: () => void;
}
export default function Model({ control, name, onRemove }: Props) {
  const intl = useIntl();
  return (
    <div className={cs.Model.row}>
      <RHFTextField
        control={control}
        name={`${name}.id`}
        ariaLabel={intl.formatMessage({ defaultMessage: "ID" })}
        placeholder="openai/gpt-oss-120b"
        className={cs.Model.nameField}
      />
      <RHFTextField
        control={control}
        name={`${name}.name`}
        ariaLabel={intl.formatMessage({ defaultMessage: "Name" })}
        placeholder="GPT OSS 120B"
        className={cs.Model.nameField}
      />
      <Capabilities control={control} name={`${name}.capabilities`} />
      <IconButton
        label={intl.formatMessage({ defaultMessage: "Remove" })}
        onPress={onRemove}
        variant="invisible-danger"
        className={cs.Model.deleteButton}
      >
        <PiTrash />
      </IconButton>
    </div>
  );
}
