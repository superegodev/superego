import { codegen, type Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import type { ResultOf } from "../../../../business-logic/backend/typeUtils.js";
import wellKnownLibPaths from "../../../../business-logic/typescript/wellKnownLibPaths.js";
import { Fields } from "../../../design-system/forms/forms.js";
import ResultErrors from "../../../design-system/ResultErrors/ResultErrors.js";
import RHFContentSummaryGetterField from "../../../widgets/RHFContentSummaryGetterField/RHFContentSummaryGetterField.js";
import RHFSubmitButton from "../../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "./CreateCollectionForm.css.js";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";

interface Props {
  control: Control<CreateCollectionFormValues, any, CreateCollectionFormValues>;
  schema: Schema;
  result: ResultOf<"collections", "create"> | null;
}
export default function ContentSummaryTab({ control, schema, result }: Props) {
  const schemaTypescriptLib = useMemo(
    () =>
      typeof schema !== "string"
        ? { path: wellKnownLibPaths.collectionSchema, source: codegen(schema) }
        : null,
    [schema],
  );
  return (
    <Fields>
      <RHFContentSummaryGetterField
        control={control}
        name="contentSummaryGetter"
        isDisabled={typeof schema === "string"}
        schema={schema}
        schemaTypescriptLib={schemaTypescriptLib}
      />
      <div className={cs.CreateCollectionForm.submitButtonContainer}>
        <RHFSubmitButton
          control={control}
          variant="primary"
          disableOnNotDirty={false}
        >
          <FormattedMessage defaultMessage="Create" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </Fields>
  );
}
