import { useId } from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { Description, Switch } from "../../design-system/forms/forms.js";
import * as cs from "./RHFAppPermissionsField.css.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
}
export default function ModalsField<T extends FieldValues>(props: Props<T>) {
  const { field } = useController(props);
  const descriptionId = useId();
  return (
    <div className={cs.ModalsField.root}>
      <Switch
        name={field.name}
        isSelected={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        aria-describedby={descriptionId}
      >
        <FormattedMessage defaultMessage="Allow browser dialogs and printing" />
      </Switch>
      <Description id={descriptionId} className={cs.ModalsField.description}>
        <FormattedMessage defaultMessage="Enables printing, alert, confirm, prompt, and other browser modal dialogs." />
      </Description>
    </div>
  );
}
