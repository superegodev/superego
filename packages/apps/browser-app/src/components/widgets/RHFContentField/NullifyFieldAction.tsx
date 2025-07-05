import type { ControllerRenderProps } from "react-hook-form";
import { PiBackspace } from "react-icons/pi";
import { useIntl } from "react-intl";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import * as cs from "./RHFContentField.css.js";

interface Props {
  isNullable: boolean;
  field: ControllerRenderProps;
  fieldLabel: string;
}
export default function NullifyFieldAction({
  isNullable,
  field,
  fieldLabel,
}: Props) {
  const intl = useIntl();
  return isNullable && field.value !== null ? (
    <FieldLabel.Action
      label={intl.formatMessage(
        { defaultMessage: "Set {fieldLabel} to null" },
        { fieldLabel },
      )}
      onPress={() => field.onChange(null)}
      className={cs.NullifyFieldAction.root}
    >
      <PiBackspace />
    </FieldLabel.Action>
  ) : null;
}
