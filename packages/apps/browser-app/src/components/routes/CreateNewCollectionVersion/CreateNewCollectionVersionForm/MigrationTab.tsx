import type { Collection } from "@superego/backend";
import { codegen, type Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import type { ResultOf } from "../../../../business-logic/backend/typeUtils.js";
import wellKnownLibPaths from "../../../../business-logic/typescript/wellKnownLibPaths.js";
import Alert from "../../../design-system/Alert/Alert.js";
import ResultError from "../../../design-system/ResultError/ResultError.js";
import RHFSubmitButton from "../../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTypescriptModuleField from "../../../widgets/RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import * as cs from "../CreateNewCollectionVersion.css.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";

interface Props {
  control: Control<
    CreateNewCollectionVersionFormValues,
    any,
    CreateNewCollectionVersionFormValues
  >;
  schema: string | Schema;
  collection: Collection;
  result: ResultOf<"collections", "createNewVersion"> | null;
}
export default function MigrationTab({
  control,
  schema,
  collection,
  result,
}: Props) {
  const intl = useIntl();
  const typescriptLibs = useMemo(
    () =>
      typeof schema !== "string"
        ? [
            {
              path: wellKnownLibPaths.currentCollectionSchema,
              source: codegen(collection.latestVersion.schema),
            },
            {
              path: wellKnownLibPaths.nextCollectionSchema,
              source: codegen(schema),
            },
          ]
        : [],
    [collection.latestVersion.schema, schema],
  );
  const includedGlobalUtils = useMemo(() => ({ LocalInstant: true }), []);
  return (
    <>
      <RHFTypescriptModuleField
        control={control}
        name="migration"
        label={intl.formatMessage({ defaultMessage: "Migration" })}
        typescriptLibs={typescriptLibs}
        includedGlobalUtils={includedGlobalUtils}
        description={intl.formatMessage({
          defaultMessage:
            "TypeScript function to migrate documents from the previous schema to the updated schema.",
        })}
      />
      <div className={cs.CreateNewCollectionVersionForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Create new version and migrate documents" />
        </RHFSubmitButton>
      </div>
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error creating new version",
          })}
        >
          <ResultError error={result.error} />
        </Alert>
      ) : null}
    </>
  );
}
