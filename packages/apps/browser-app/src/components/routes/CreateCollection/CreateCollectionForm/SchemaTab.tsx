import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFSchemaField from "../../../widgets/RHFSchemaField/RHFSchemaField.jsx";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";

interface Props {
  control: Control<CreateCollectionFormValues, any, CreateCollectionFormValues>;
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
