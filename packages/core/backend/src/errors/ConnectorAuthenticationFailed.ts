import type { ResultError } from "@superego/global-types";

type ConnectorAuthenticationFailed = ResultError<
  "ConnectorAuthenticationFailed",
  {
    cause: any;
  }
>;
export default ConnectorAuthenticationFailed;
