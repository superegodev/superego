import { codegen, type Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import type { ResultOf } from "../../../../business-logic/backend/typeUtils.js";
import Alert from "../../../design-system/Alert/Alert.js";
import ResultError from "../../../design-system/ResultError/ResultError.js";
import RHFContentSummaryGetterField from "../../../widgets/RHFContentSummaryGetterField/RHFContentSummaryGetterField.js";
import RHFSubmitButton from "../../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "../CreateCollection.css.js";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";
import schemaTypescriptLibPath from "./schemaTypescriptLibPath.js";

interface Props {
  control: Control<CreateCollectionFormValues, any, CreateCollectionFormValues>;
  schema: Schema;
  result: ResultOf<"collections", "create"> | null;
}
export default function ContentSummaryTab({ control, schema, result }: Props) {
  const intl = useIntl();
  const schemaTypescriptLib = useMemo(
    () =>
      typeof schema !== "string"
        ? { path: schemaTypescriptLibPath, source: codegen(schema) }
        : null,
    [schema],
  );
  return (
    <>
      <RHFContentSummaryGetterField
        control={control}
        name="contentSummaryGetter"
        isDisabled={typeof schema === "string"}
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
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error creating collection",
          })}
        >
          <ResultError error={result.error} />
        </Alert>
      ) : null}
    </>
  );
}
