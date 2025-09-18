import type { Document } from "@superego/backend";
import { type Schema, utils } from "@superego/schema";
import type { Control } from "react-hook-form";
import AnyField from "./AnyField.js";
import { DocumentProvider } from "./document.js";
import { ShowNullabilityProvider } from "./showNullability.js";

interface Props {
  schema: Schema;
  control: Control;
  document: Document | null;
  showNullability?: boolean;
}
export default function RHFContentField({
  schema,
  control,
  document,
  showNullability = false,
}: Props) {
  return (
    <ShowNullabilityProvider value={showNullability}>
      <DocumentProvider value={document}>
        <AnyField
          schema={schema}
          typeDefinition={utils.getRootType(schema)}
          isNullable={false}
          isListItem={false}
          control={control}
          name=""
          label=""
        />
      </DocumentProvider>
    </ShowNullabilityProvider>
  );
}
