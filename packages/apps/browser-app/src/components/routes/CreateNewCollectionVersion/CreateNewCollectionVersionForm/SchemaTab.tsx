import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../../design-system/Alert/Alert.js";
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
    <>
      <Alert variant="info">
        <FormattedMessage
          defaultMessage={`
            <p>
              Every time you want to change the schema of a collection (e.g., to
              add, change, or remove properties), you need to create a new
              collection version. The process involves the following steps:
            </p>
            <ol>
              <li>Implement the schema changes you want to make.</li>
              <li>
                Update the collection's content summary getter to reflect those
                changes.
              </li>
              <li>
                If the collection has a remote, update its remote converters as
                well.
              </li>
              <li>
                Write a migration function to convert documents from the
                previous schema to the updated schema.
              </li>
            </ol>
          `}
          values={formattedMessageHtmlTags}
        />
      </Alert>
      <RHFSchemaField
        control={control}
        name="schema"
        label={intl.formatMessage({ defaultMessage: "Schema" })}
      />
    </>
  );
}
