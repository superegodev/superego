import type { App, Collection } from "@superego/backend";
import type { Control } from "react-hook-form";

export default interface Props {
  control: Control<any>;
  name: string;
  app: App | null;
  targetCollections: Collection[];
}
