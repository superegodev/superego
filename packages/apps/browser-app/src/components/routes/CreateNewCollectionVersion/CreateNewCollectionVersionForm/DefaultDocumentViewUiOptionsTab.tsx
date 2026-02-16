import type { Schema } from "@superego/schema";
import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFDefaultDocumentViewUiOptionsField from "../../../widgets/RHFDefaultDocumentViewUiOptionsField/RHFDefaultDocumentViewUiOptionsField.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";

interface Props {
  control: Control<
    CreateNewCollectionVersionFormValues,
    any,
    CreateNewCollectionVersionFormValues
  >;
  schema: string | Schema;
}
export default function DefaultDocumentViewUiOptionsTab({
  control,
  schema,
}: Props) {
  const intl = useIntl();
  return typeof schema !== "string" ? (
    <RHFDefaultDocumentViewUiOptionsField
      control={control}
      name="defaultDocumentViewUiOptions"
      label={intl.formatMessage({
        defaultMessage: "Default document view UI options",
      })}
    />
  ) : null;
}
