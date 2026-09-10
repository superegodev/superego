import type { Control, FieldArrayPath, FieldValues } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import RHFTextListField from "../RHFTextListField/RHFTextListField.js";
import HttpOriginField from "./HttpOriginField.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldArrayPath<T>;
}
export default function HttpOriginsField<T extends FieldValues>({
  control,
  name,
}: Props<T>) {
  return (
    <RHFTextListField
      control={control}
      name={name}
      label={
        <FormattedMessage defaultMessage="Allow HTTP requests to these destinations:" />
      }
      renderItem={(itemName, itemIndex, autoFocus) => (
        <HttpOriginField
          control={control}
          name={itemName}
          itemIndex={itemIndex}
          autoFocus={autoFocus}
        />
      )}
    />
  );
}
