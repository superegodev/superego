import { codegen, type Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import wellKnownLibPaths from "../../../../business-logic/typescript/wellKnownLibPaths.js";
import RHFContentBlockingKeysGetterField from "../../../widgets/RHFContentBlockingKeysGetterField/RHFContentBlockingKeysGetterField.js";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";

interface Props {
  control: Control<CreateCollectionFormValues, any, CreateCollectionFormValues>;
  schema: Schema;
}
export default function ContentBlockingKeysTab({ control, schema }: Props) {
  const schemaTypescriptLib = useMemo(
    () =>
      typeof schema !== "string"
        ? { path: wellKnownLibPaths.collectionSchema, source: codegen(schema) }
        : null,
    [schema],
  );
  return (
    <RHFContentBlockingKeysGetterField
      control={control}
      name="contentBlockingKeysGetter"
      isDisabled={typeof schema === "string"}
      schema={schema}
      schemaTypescriptLib={schemaTypescriptLib}
    />
  );
}
