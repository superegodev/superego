import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import MessageSchema from "../types/Message.js";

const WriteTypescriptModuleToolNotCalledSchema = defineError(
  "WriteTypescriptModuleToolNotCalled",
  v.object({ generatedMessage: MessageSchema }),
);
export default WriteTypescriptModuleToolNotCalledSchema;
export type WriteTypescriptModuleToolNotCalled = v.InferOutput<
  typeof WriteTypescriptModuleToolNotCalledSchema
>;
