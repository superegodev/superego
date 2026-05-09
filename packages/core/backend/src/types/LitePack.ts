import * as v from "valibot";
import PackIdSchema from "../ids/PackId.js";
import LitePackInfoSchema from "./LitePackInfo.js";

const LitePackSchema = v.object({
  id: PackIdSchema,
  info: LitePackInfoSchema,
});
export default LitePackSchema;
export type LitePack = v.InferOutput<typeof LitePackSchema>;
