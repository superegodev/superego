import type { ResultError } from "@superego/global-types";
import type Message from "../types/Message.js";

type WriteTypescriptFunctionToolNotCalled = ResultError<
  "WriteTypescriptFunctionToolNotCalled",
  {
    generatedMessage: Message;
  }
>;
export default WriteTypescriptFunctionToolNotCalled;
