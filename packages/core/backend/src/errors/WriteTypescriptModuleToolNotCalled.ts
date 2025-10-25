import type { ResultError } from "@superego/global-types";
import type Message from "../types/Message.js";

type WriteTypescriptModuleToolNotCalled = ResultError<
  "WriteTypescriptModuleToolNotCalled",
  {
    generatedMessage: Message;
  }
>;
export default WriteTypescriptModuleToolNotCalled;
