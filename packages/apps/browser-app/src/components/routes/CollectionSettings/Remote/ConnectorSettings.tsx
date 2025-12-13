import type { Schema } from "@superego/schema";
import type { Control } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import Fieldset from "../../../design-system/Fieldset/Fieldset.js";
import RHFContentField from "../../../widgets/RHFContentField/RHFContentField.js";
import type FormValues from "./FormValues.js";

interface Props {
  control: Control<FormValues>;
  schema: Schema;
}
export default function ConnectorSettings({ control, schema }: Props) {
  return (
    <Fieldset isDisclosureDisabled={true}>
      <Fieldset.Legend>
        <FormattedMessage defaultMessage="Connector settings" />
      </Fieldset.Legend>
      <Fieldset.Fields>
        <RHFContentField
          control={control}
          name="connectorSettings"
          schema={schema}
          showTypes={false}
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}
