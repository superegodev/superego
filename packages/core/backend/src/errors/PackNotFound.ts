import type { ResultError } from "@superego/global-types";
import type PackId from "../ids/PackId.js";

type PackNotFound = ResultError<
  "PackNotFound",
  {
    packId: PackId;
  }
>;
export default PackNotFound;
