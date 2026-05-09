import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";

const ConnectorAuthenticationFailedSchema = defineError(
  "ConnectorAuthenticationFailed",
  v.object({ cause: v.any() }),
);
export default ConnectorAuthenticationFailedSchema;
export type ConnectorAuthenticationFailed = v.InferOutput<
  typeof ConnectorAuthenticationFailedSchema
>;
