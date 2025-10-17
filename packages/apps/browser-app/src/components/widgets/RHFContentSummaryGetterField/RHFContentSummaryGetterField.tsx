import type { TypescriptLib } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";

interface Props {
  control: Control<any>;
  name: string;
  isDisabled?: boolean | undefined;
  schema: Schema;
  schemaTypescriptLib: TypescriptLib | null;
}
export default function RHFContentSummaryGetterField({
  control,
  name,
  isDisabled,
  schema,
  schemaTypescriptLib,
}: Props) {
  const intl = useIntl();
  const typescriptLibs = useMemo(
    () => (schemaTypescriptLib ? [schemaTypescriptLib] : []),
    [schemaTypescriptLib],
  );
  const includedGlobalUtils = useMemo(() => ({ LocalInstant: true }), []);
  return (
    <RHFTypescriptModuleField
      label={intl.formatMessage({ defaultMessage: "Content summary getter" })}
      control={control}
      name={name}
      isDisabled={isDisabled}
      typescriptLibs={typescriptLibs}
      includedGlobalUtils={includedGlobalUtils}
      assistantImplementation={{
        instructions: `
### Context

The "content summary" of a document is an object—derived from the document's
content—that contains its most important bits of information. The properties of
the object are displayed when showing a "summary view" of the document; for
example, in tables where each property becomes a column.

### Your task

You need to complete the implementation of the function that derives the summary
from the document content.

### Rules

- The content summary object must have between 1 and 5 properties.
- Only include the most salient and useful pieces of information.
- A summary property doesn't necessarily need to have a 1-to-1 correspondence
  with a document property: it can be a value derived from more than one
  document properties.
- The properties must always exist, but you can use \`null\` for empty values.

### Additional info

The property names of the summary object can include an "attributes" prefix that
configures the behavior of the UIs that render the summary. Examples:

- \`"{position:0,sortable:true,default-sort:asc} Prop Zero"\`:
  - property displayed first;
  - when rendered in a table, the property's column is sortable;
  - when rendered in a table, the table is—by default—sorted by the property's
    column, in ascending order.
- \`"{position:1} Prop One"\`:
  - property displayed second;
  - when rendered in a table, the property's column is not sortable.

(Note: it only makes sense to define \`default-sort\` for one property.)
        `.trim(),
        template: forms.defaults.contentSummaryGetter(schema).source,
      }}
      description={
        <FormattedMessage
          defaultMessage={`
            <p>
              The <b>content summary</b> of a document is a<code>Record'<name:
              string, value: string | number | boolean | null>' </code>—derived
              from the document's content—that contains its most important bits
              of information. The properties of the record are displayed when
              showing a "summary view" of the document; for example, in tables,
              where each property becomes a column.
            </p>
            <p>
              <b>Content summary getter</b> is the TypeScript function that
              derives the summary from the document content.
            </p>
            <p>
              The property names of the summary object can be prefixed by
              attributes that configure the behavior of the UIs that render the
              summary. For example, when rendering a table of documents,
              <code>'{position:0,sortable:true,default-sort:asc}' First Name</code>
              makes <code>First Name</code> the first column, makes it sortable,
              and sets the column as the default sort order of the table.
            </p>
          `}
          values={formattedMessageHtmlTags}
        />
      }
    />
  );
}
