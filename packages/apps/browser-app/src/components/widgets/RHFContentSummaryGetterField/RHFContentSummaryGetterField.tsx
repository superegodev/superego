import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import type TypescriptLib from "../../design-system/CodeInput/typescript/TypescriptLib.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";

interface Props {
  control: Control<any>;
  name: string;
  isDisabled?: boolean | undefined;
  schemaTypescriptLib: TypescriptLib | null;
}
export default function RHFContentSummaryGetterField({
  control,
  name,
  isDisabled,
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
      description={
        <FormattedMessage
          defaultMessage={`
            <p>
              The <b>content summary</b> of a document is a
              <code>Record'<name: string, value: string | number | boolean | null>'</code>
              — derived from its content — that contains its most important bits
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
