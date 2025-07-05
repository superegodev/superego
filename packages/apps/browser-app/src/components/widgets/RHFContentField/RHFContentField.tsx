import type { Document } from "@superego/backend";
import { type Schema, utils } from "@superego/schema";
import type { Control } from "react-hook-form";
import AnyField from "./AnyField.js";
import { DocumentProvider } from "./document.js";

interface Props {
  schema: Schema;
  control: Control;
  document: Document | null;
}
export default function RHFContentField({ schema, control, document }: Props) {
  return (
    <DocumentProvider value={document}>
      <AnyField
        schema={schema}
        typeDefinition={utils.rootType(schema)}
        isNullable={false}
        isListItem={false}
        control={control}
        name=""
        label=""
      />
    </DocumentProvider>
  );
}
