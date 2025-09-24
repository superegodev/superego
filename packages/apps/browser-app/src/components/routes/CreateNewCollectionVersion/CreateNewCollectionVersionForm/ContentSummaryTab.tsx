import { codegen, type Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import wellKnownLibPaths from "../../../../business-logic/typescript/wellKnownLibPaths.js";
import RHFContentSummaryGetterField from "../../../widgets/RHFContentSummaryGetterField/RHFContentSummaryGetterField.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";

interface Props {
  control: Control<
    CreateNewCollectionVersionFormValues,
    any,
    CreateNewCollectionVersionFormValues
  >;
  schema: string | Schema;
}
export default function ContentSummaryTab({ control, schema }: Props) {
  const schemaTypescriptLib = useMemo(
    () =>
      typeof schema !== "string"
        ? { path: wellKnownLibPaths.collectionSchema, source: codegen(schema) }
        : null,
    [schema],
  );
  return (
    <RHFContentSummaryGetterField
      control={control}
      name="contentSummaryGetter"
      schemaTypescriptLib={schemaTypescriptLib}
    />
  );
}
