import type { Document } from "@superego/backend";
import { type Schema, utils } from "@superego/schema";
import type { Control } from "react-hook-form";
import AnyField from "./AnyField.js";
import { DocumentProvider } from "./document.js";
import { ShowNullabilityProvider } from "./showNullability.js";
import { ZoomLevelProvider } from "./zoomLevel.js";

interface Props {
  schema: Schema;
  control: Control;
  document: Document | null;
  showNullability?: boolean;
  zoomLevel?: number;
}
export default function RHFContentField({
  schema,
  control,
  document,
  showNullability = false,
  zoomLevel = 1,
}: Props) {
  return (
    <DocumentProvider value={document}>
      <ShowNullabilityProvider value={showNullability}>
        <ZoomLevelProvider value={zoomLevel}>
          <AnyField
            schema={schema}
            typeDefinition={utils.getRootType(schema)}
            isNullable={false}
            isListItem={false}
            control={control}
            name=""
            label=""
          />
        </ZoomLevelProvider>
      </ShowNullabilityProvider>
    </DocumentProvider>
  );
}
