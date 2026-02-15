import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import { type Schema, utils } from "@superego/schema";
import type { Control } from "react-hook-form";
import AnyField from "./AnyField.js";
import { type UiOptions, UiOptionsProvider } from "./uiOptions.js";

interface Props {
  schema: Schema;
  control: Control<any>;
  name?: string;
  showTypes?: boolean;
  showNullability?: boolean;
  zoomLevel?: number;
  isReadOnly?: boolean;
  protoCollections?: UiOptions["protoCollections"];
  defaultDocumentViewUiOptions?: DefaultDocumentViewUiOptions | null;
}
export default function RHFContentField({
  schema,
  control,
  name = "",
  showTypes = true,
  showNullability = false,
  zoomLevel = 1,
  isReadOnly = false,
  protoCollections = [],
  defaultDocumentViewUiOptions = null,
}: Props) {
  return (
    <UiOptionsProvider
      value={{
        showTypes,
        showNullability,
        zoomLevel,
        isReadOnly,
        protoCollections,
        defaultDocumentViewUiOptions,
      }}
    >
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
