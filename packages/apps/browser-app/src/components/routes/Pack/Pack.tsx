import type { PackId } from "@superego/backend";
import BoutiquePack from "./BoutiquePack.js";

interface Props {
  packId: PackId;
}
export default function Pack({ packId }: Props) {
  return <BoutiquePack packId={packId} />;
}
