import { useMemo } from "react";
import { type Control, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";
import type TypescriptLib from "../../design-system/CodeInput/typescript/TypescriptLib.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import RHFTextField from "../RHFTextField/RHFTextField.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";

interface Props {
  control: Control<any>;
  name: string;
  isDisabled?: boolean | undefined;
  schemaTypescriptLib: TypescriptLib | null;
  defaultExpanded?: boolean | undefined;
  className?: string | undefined;
}
export default function RHFSummaryPropertyDefinitionField({
  control,
  name,
  isDisabled,
  schemaTypescriptLib,
  defaultExpanded,
  className,
}: Props) {
  const intl = useIntl();
  const summaryPropertyDefinition = useWatch({ control, name });
  const typescriptLibs = useMemo(
    () => (schemaTypescriptLib ? [schemaTypescriptLib] : []),
    [schemaTypescriptLib],
  );
  const includedGlobalUtils = useMemo(() => ({ LocalInstant: true }), []);
  return (
    <Fieldset defaultExpanded={defaultExpanded} className={className}>
      <Fieldset.Legend>{summaryPropertyDefinition.name}</Fieldset.Legend>
      <Fieldset.Fields>
        <RHFTextField
          control={control}
          name={`${name}.name`}
          isDisabled={isDisabled}
          label={intl.formatMessage({ defaultMessage: "Name" })}
        />
        <RHFTypescriptModuleField
          control={control}
          name={`${name}.getter`}
          isDisabled={isDisabled}
          label={intl.formatMessage({ defaultMessage: "Value getter" })}
          typescriptLibs={typescriptLibs}
          includedGlobalUtils={includedGlobalUtils}
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}
