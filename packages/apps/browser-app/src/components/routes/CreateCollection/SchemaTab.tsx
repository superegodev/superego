import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFSchemaField from "../../widgets/RHFSchemaField/RHFSchemaField.js";
import * as cs from "./CreateCollection.css.js";
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
      className={cs.SchemaTab.schemaTextField}
    />
  );
}
