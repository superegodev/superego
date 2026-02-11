import type PackId from "../ids/PackId.js";
import type LitePackInfo from "./LitePackInfo.js";

export default interface LitePack {
  id: PackId;
  info: LitePackInfo;
}
