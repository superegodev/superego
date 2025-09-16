import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import type TypescriptLib from "../../design-system/CodeInput/typescript/TypescriptLib.js";
import InlineCode from "../../design-system/InlineCode/InlineCode.jsx";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import * as cs from "./RHFContentSummaryGetterField.css.js";

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
              <code>Record'<name: string, value: string>'</code>—derived from
              its content—that contains its most important bits of information.
              These are displayed when showing a "summary view" of the document.
              For example, they are shown in documents tables, where there's a
              column for each property of the record.
            </p>
            <p>
              This is the function that is run on the document content and
              derives the content summary record.
            </p>
          `}
          values={{
            // Hack to avoid React 19 key errors. Should be solved in the next
            // version of react-intl. At that point, remove the keys.
            b: (chunks) => <b key={(chunks as string[])[0]}>{chunks}</b>,
            p: (chunks) => <p key={(chunks as string[])[0]}>{chunks}</p>,
            code: (chunks) => (
              <InlineCode
                key={(chunks as string[])[0]}
                className={cs.RHFContentSummaryGetterField.inlineCode}
              >
                {chunks}
              </InlineCode>
            ),
          }}
        />
      }
    />
  );
}
