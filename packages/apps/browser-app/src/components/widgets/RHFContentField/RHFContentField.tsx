import type { Document } from "@superego/backend";
import { type Schema, utils } from "@superego/schema";
import type { Control } from "react-hook-form";
import AnyField from "./AnyField.js";
import { DocumentProvider } from "./document.js";
import { UiOptionsProvider } from "./uiOptions.js";

interface Props {
  schema: Schema;
  control: Control<any>;
  document: Document | null;
  name?: string;
  showTypes?: boolean;
  showNullability?: boolean;
  zoomLevel?: number;
}
export default function RHFContentField({
  schema,
  control,
  document,
  name = "",
  showTypes = true,
  showNullability = false,
  zoomLevel = 1,
}: Props) {
  return (
    <DocumentProvider value={document}>
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
    </DocumentProvider>
  );
}
