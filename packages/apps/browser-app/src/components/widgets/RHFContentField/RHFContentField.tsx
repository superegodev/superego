import type { DefaultDocumentLayoutOptions } from "@superego/backend";
import { type Schema, utils } from "@superego/schema";
import type { Control } from "react-hook-form";
import AnyField from "./AnyField.js";
import { DocumentLayoutOptionsProvider } from "./documentLayoutOptions.js";
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
  defaultDocumentLayoutOptions?: DefaultDocumentLayoutOptions | null;
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
  defaultDocumentLayoutOptions = null,
}: Props) {
  return (
    <DocumentLayoutOptionsProvider value={defaultDocumentLayoutOptions}>
      <UiOptionsProvider
        value={{
          showTypes,
          showNullability,
          zoomLevel,
          isReadOnly,
          protoCollections,
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
    </DocumentLayoutOptionsProvider>
  );
}
