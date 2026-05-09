import * as v from "valibot";

enum ConnectorAuthenticationStrategy {
  ApiKey = "ApiKey",
  OAuth2PKCE = "OAuth2PKCE",
}
export default ConnectorAuthenticationStrategy;

export const ConnectorAuthenticationStrategySchema = v.enum(
  ConnectorAuthenticationStrategy,
);
