import type { Control, FieldValues, FieldPath } from "react-hook-form";
import DownloadsField from "./DownloadsField.js";
import HttpOriginsField from "./HttpOriginsField.js";
import ModalsField from "./ModalsField.js";
import * as cs from "./RHFAppPermissionsField.css.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
}
export default function RHFAppPermissionsField<T extends FieldValues>({
  control,
  name,
}: Props<T>) {
  return (
    <div className={cs.RHFAppPermissionsField.root}>
      <ModalsField control={control} name={`${name}.modals` as FieldPath<T>} />
      <DownloadsField
        control={control}
        name={`${name}.downloads` as FieldPath<T>}
      />
      <HttpOriginsField
        control={control}
        name={`${name}.http.allowedOrigins` as FieldPath<T>}
      />
    </div>
  );
}
