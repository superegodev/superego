import type { Collection } from "@superego/backend";
import type { Control } from "react-hook-form";

export default interface Props {
  control: Control<any>;
  name: string;
  targetCollections: Collection[];
}
