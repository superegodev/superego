import type { SummaryPropertyDefinition } from "@superego/backend";
import { codegen } from "@superego/schema";
import { useEffect, useMemo, useRef } from "react";
import type {
  Control,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useIntl } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import RHFSummaryPropertyDefinitionsField from "../../widgets/RHFSummaryPropertyDefinitionsField/RHFSummaryPropertyDefinitionsField.js";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";
import schemaTypescriptLibPath from "./schemaTypescriptLibPath.js";

interface Props {
  control: Control<CreateCollectionFormValues, any, CreateCollectionFormValues>;
  watch: UseFormWatch<CreateCollectionFormValues>;
  getValues: UseFormGetValues<CreateCollectionFormValues>;
  setValue: UseFormSetValue<CreateCollectionFormValues>;
  defaultSummaryPropertyDefinition: SummaryPropertyDefinition;
}
export default function SummaryPropertiesTab({
  control,
  watch,
  getValues,
  setValue,
  defaultSummaryPropertyDefinition,
}: Props) {
  const intl = useIntl();

  const schema = watch("schema");

  // When schema changes, for each summary property, if the user didn't make any
  // change to the getter (hence it's still the default one), update it.
  const defaultGetterRef = useRef(defaultSummaryPropertyDefinition.getter);
  useEffect(() => {
    if (typeof schema === "string") {
      return;
    }
    const newDefaultGetter = forms.defaults.summaryPropertyDefinitionGetter(
      schema,
      schemaTypescriptLibPath,
    );
    getValues("summaryProperties").forEach(({ getter }, index) => {
      if (getter.source === defaultGetterRef.current.source) {
        setValue(`summaryProperties.${index}.getter`, newDefaultGetter);
      }
    });
    defaultGetterRef.current = newDefaultGetter;
  }, [schema, getValues, setValue]);

  const schemaTypescriptLib = useMemo(
    () =>
      typeof schema !== "string"
        ? ({ path: schemaTypescriptLibPath, source: codegen(schema) } as const)
        : null,
    [schema],
  );
  return (
    <RHFSummaryPropertyDefinitionsField
      control={control}
      name="summaryProperties"
      isDisabled={typeof schema === "string"}
      schemaTypescriptLib={schemaTypescriptLib}
      getDefaultSummaryPropertyDefinition={(index) =>
        forms.defaults.summaryPropertyDefinition(
          index,
          schema,
          schemaTypescriptLibPath,
          intl,
        )
      }
    />
  );
}
