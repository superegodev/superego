import type { Collection } from "@superego/backend";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../../design-system/Alert/Alert.js";
import { Fields } from "../../../design-system/forms/forms.js";
import RHFSchemaField from "../../../widgets/RHFSchemaField/RHFSchemaField.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";

interface Props {
  control: Control<
    CreateNewCollectionVersionFormValues,
    any,
    CreateNewCollectionVersionFormValues
  >;
  collection: Collection;
}
export default function SchemaTab({ control, collection }: Props) {
  const intl = useIntl();
  return (
    <Fields>
      <Alert variant="info">
        {CollectionUtils.hasRemote(collection) ? (
          <FormattedMessage
            defaultMessage={`
              <p>
                Every time you want to change the schema of a collection (e.g.,
                to add, change, or remove properties), you need to create a new
                collection version. The process involves the following steps:
              </p>
              <ol>
                <li>Implement the schema changes you want to make.</li>
                <li>
                  Update the collection's content summary getter to reflect
                  those changes.
                </li>
                <li>
                  Since this is a remote collection, update its remote
                  converters as well.
                </li>
              </ol>
            `}
            values={formattedMessageHtmlTags}
          />
        ) : (
          <FormattedMessage
            defaultMessage={`
              <p>
                Every time you want to change the schema of a collection (e.g.,
                to add, change, or remove properties), you need to create a new
                collection version. The process involves the following steps:
              </p>
              <ol>
                <li>Implement the schema changes you want to make.</li>
                <li>
                  Update the collection's content summary getter to reflect
                  those changes.
                </li>
                <li>
                  Write a migration function to convert documents from the
                  previous schema to the updated schema.
                </li>
              </ol>
            `}
            values={formattedMessageHtmlTags}
          />
        )}
      </Alert>
      <RHFSchemaField
        control={control}
        name="schema"
        label={intl.formatMessage({ defaultMessage: "Schema" })}
      />
    </Fields>
  );
}
