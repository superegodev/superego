import { useMemo } from "react";
import { type Control, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import I18nString from "../../design-system/I18nString/I18nString.js";
import type TypescriptLib from "../../design-system/TypescriptModuleInput/TypescriptLib.js";
import RHFI18nStringField from "../RHFI18nStringField/RHFI18nStringField.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";

interface Props {
  control: Control<any>;
  name: string;
  isDisabled?: boolean | undefined;
  schemaTypescriptLib: TypescriptLib | null;
  className?: string | undefined;
}
export default function RHFSummaryPropertyDefinitionField({
  control,
  name,
  isDisabled,
  schemaTypescriptLib,
}: Props) {
  const intl = useIntl();
  const summaryPropertyDefinition = useWatch({ control, name });
  const typescriptLibs = useMemo(
    () => (schemaTypescriptLib ? [schemaTypescriptLib] : []),
    [schemaTypescriptLib],
  );
  return (
    <Fieldset>
      <Fieldset.Legend>
        <I18nString value={summaryPropertyDefinition.name} />
      </Fieldset.Legend>
      <Fieldset.Fields>
        <RHFI18nStringField
          control={control}
          name={`${name}.name`}
          isDisabled={isDisabled}
          label={intl.formatMessage({ defaultMessage: "Name" })}
        />
        <RHFI18nStringField
          control={control}
          name={`${name}.description`}
          isDisabled={isDisabled}
          label={intl.formatMessage({ defaultMessage: "Description" })}
          textArea={true}
        />
        <RHFTypescriptModuleField
          control={control}
          name={`${name}.getter`}
          isDisabled={isDisabled}
          label={intl.formatMessage({ defaultMessage: "Value getter" })}
          description={intl.formatMessage({
            defaultMessage:
              "TypeScript function to get the property value (a string) from the document's content",
          })}
          typescriptLibs={typescriptLibs}
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}
