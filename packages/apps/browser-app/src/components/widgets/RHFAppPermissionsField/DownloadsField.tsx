import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { Switch } from "../../design-system/forms/forms.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
}
export default function DownloadsField<T extends FieldValues>(props: Props<T>) {
  const { field } = useController(props);
  return (
    <Switch
      name={field.name}
      isSelected={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
    >
      <FormattedMessage defaultMessage="Allow file downloads" />
    </Switch>
  );
}
