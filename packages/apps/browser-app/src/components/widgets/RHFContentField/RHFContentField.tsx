import { type Schema, utils } from "@superego/schema";
import type { Control } from "react-hook-form";
import AnyField from "./AnyField.js";
import { UiOptionsProvider } from "./uiOptions.js";

interface Props {
  schema: Schema;
  control: Control<any>;
  name?: string;
  showTypes?: boolean;
  showNullability?: boolean;
  zoomLevel?: number;
}
export default function RHFContentField({
  schema,
  control,
  name = "",
  showTypes = true,
  showNullability = false,
  zoomLevel = 1,
}: Props) {
  return (
    <UiOptionsProvider value={{ showTypes, showNullability, zoomLevel }}>
      <AnyField
        schema={schema}
        typeDefinition={utils.getRootType(schema)}
        isNullable={false}
        isListItem={false}
        control={control}
        name={name}
        label=""
      />
    </UiOptionsProvider>
  );
}
