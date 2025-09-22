import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFSchemaField from "../../../widgets/RHFSchemaField/RHFSchemaField.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";

interface Props {
  control: Control<
    CreateNewCollectionVersionFormValues,
    any,
    CreateNewCollectionVersionFormValues
  >;
}
export default function SchemaTab({ control }: Props) {
  const intl = useIntl();
  return (
    <RHFSchemaField
      control={control}
      name="schema"
      label={intl.formatMessage({ defaultMessage: "Schema" })}
    />
  );
}
