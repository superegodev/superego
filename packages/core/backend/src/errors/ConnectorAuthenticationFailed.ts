import type { ResultError } from "@superego/global-types";

type ConnectorAuthenticationFailed = ResultError<
  "ConnectorAuthenticationFailed",
  {
    reason: string;
  }
>;
export default ConnectorAuthenticationFailed;
