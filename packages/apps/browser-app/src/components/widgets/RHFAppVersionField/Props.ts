import type { App, Collection } from "@superego/backend";
import type { Control, FieldValues } from "react-hook-form";

export default interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: string;
  app: App | null;
  collections: Collection[];
}
