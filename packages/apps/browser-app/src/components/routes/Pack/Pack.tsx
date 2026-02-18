import type { PackId } from "@superego/backend";
import { PackSource } from "../../../business-logic/navigation/Route.js";
import BazaarPack from "./BazaarPack.js";
import LocalPack from "./LocalPack.js";

interface Props {
  packId: PackId;
  source: PackSource;
}
export default function Pack({ packId, source }: Props) {
  return source === PackSource.Local ? (
    <LocalPack packId={packId} />
  ) : (
    <BazaarPack packId={packId} />
  );
}
