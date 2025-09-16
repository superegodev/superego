import type { TypescriptModule } from "@superego/backend";
import { codegen } from "@superego/schema";
import { useEffect, useMemo, useRef } from "react";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import forms from "../../../../business-logic/forms/forms.js";
import RHFContentSummaryGetterField from "../../../widgets/RHFContentSummaryGetterField/RHFContentSummaryGetterField.js";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";
import schemaTypescriptLibPath from "./schemaTypescriptLibPath.js";

interface Props {
  control: Control<CreateCollectionFormValues, any, CreateCollectionFormValues>;
  watch: UseFormWatch<CreateCollectionFormValues>;
  setValue: UseFormSetValue<CreateCollectionFormValues>;
  defaultContentSummaryGetter: TypescriptModule;
}
export default function ContentSummaryTab({
  control,
  watch,
  setValue,
  defaultContentSummaryGetter,
}: Props) {
  const schema = watch("schema");

  // TODO: use reset api
  // When schema changes, for each summary property, if the user didn't make any
  // change to the getter (hence it's still the default one), update it.
  const defaultGetterRef = useRef(defaultContentSummaryGetter);
  useEffect(() => {
    if (typeof schema === "string") {
      return;
    }
    const newDefaultGetter = forms.defaults.contentSummaryGetter(
      schema,
      schemaTypescriptLibPath,
    );
    setValue("contentSummaryGetter", newDefaultGetter);
    defaultGetterRef.current = newDefaultGetter;
  }, [schema, setValue]);

  const schemaTypescriptLib = useMemo(
    () =>
      typeof schema !== "string"
        ? ({ path: schemaTypescriptLibPath, source: codegen(schema) } as const)
        : null,
    [schema],
  );
  return (
    <RHFContentSummaryGetterField
      control={control}
      name="contentSummaryGetter"
      isDisabled={typeof schema === "string"}
      schemaTypescriptLib={schemaTypescriptLib}
    />
  );
}
