import type { Schema } from "@superego/schema";
import type { Control } from "react-hook-form";
import RHFDefaultDocumentContentField from "../../../widgets/RHFDefaultDocumentContentField/RHFDefaultDocumentContentField.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";

interface Props {
  control: Control<
    CreateNewCollectionVersionFormValues,
    any,
    CreateNewCollectionVersionFormValues
  >;
  schema: string | Schema;
}
export default function DefaultDocumentContentTab({ control, schema }: Props) {
  return typeof schema !== "string" ? (
    <RHFDefaultDocumentContentField
      control={control}
      name="defaultDocumentContent"
    />
  ) : null;
}
