import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import { type Schema, utils } from "@superego/schema";
import type { Control, FieldValues } from "react-hook-form";
import AnyField from "./AnyField.js";
import { type UiOptions, UiOptionsProvider } from "./uiOptions.js";

interface Props<T extends FieldValues = FieldValues> {
  schema: Schema;
  control: Control<T>;
  name?: string;
  showTypes?: boolean;
  showNullability?: boolean;
  zoomLevel?: number;
  isReadOnly?: boolean;
  protoCollections?: UiOptions["protoCollections"];
  defaultDocumentViewUiOptions?: DefaultDocumentViewUiOptions | null;
  documentId?: string | null;
  autoFocus?: boolean;
}
export default function RHFContentField<T extends FieldValues>({
  schema,
  control,
  name = "",
  showTypes = true,
  showNullability = false,
  zoomLevel = 1,
  isReadOnly = false,
  protoCollections = [],
  defaultDocumentViewUiOptions = null,
  documentId = null,
  autoFocus = false,
}: Props<T>) {
  return (
    <UiOptionsProvider
      value={{
        showTypes,
        showNullability,
        zoomLevel,
        isReadOnly,
        protoCollections,
        defaultDocumentViewUiOptions,
        documentId,
      }}
    >
      <AnyField
        schema={schema}
        typeDefinition={utils.getRootType(schema)}
        isNullable={false}
        isListItem={false}
        control={control as Control}
        name={name}
        label=""
        autoFocus={autoFocus}
      />
    </UiOptionsProvider>
  );
}
