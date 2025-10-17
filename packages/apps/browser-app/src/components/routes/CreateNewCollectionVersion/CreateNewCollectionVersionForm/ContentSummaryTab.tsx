import { codegen, type Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import wellKnownLibPaths from "../../../../business-logic/typescript/wellKnownLibPaths.js";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../../design-system/Alert/Alert.js";
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
  return typeof schema !== "string" ? (
    <>
      <Alert variant="info">
        <FormattedMessage
          defaultMessage="Update the <code>getContentSummary</code> function to reflect schema changes."
          values={formattedMessageHtmlTags}
        />
      </Alert>
      <RHFContentSummaryGetterField
        control={control}
        name="contentSummaryGetter"
        schema={schema}
        schemaTypescriptLib={schemaTypescriptLib}
      />
    </>
  ) : null;
}
