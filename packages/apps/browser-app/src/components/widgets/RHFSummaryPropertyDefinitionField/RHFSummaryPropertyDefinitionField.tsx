import { useMemo } from "react";
import { type Control, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import type TypescriptLib from "../../design-system/TypescriptModuleInput/TypescriptLib.js";
import RHFTextField from "../RHFTextField/RHFTextField.js";
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
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}
