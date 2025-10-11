import type { Connector } from "@superego/executing-backend";
import type { Schema } from "@superego/schema";

/**
 * Utility function to get automatic type definitions when defining the
 * connector.
 */
export default function defineConnector<
  Options,
  const SettingsSchema extends Schema,
  const RemoteDocument,
>(
  connectorGetter: (
    options: Options,
  ) => Connector<SettingsSchema, RemoteDocument>,
): (options: Options) => Connector {
  return connectorGetter as any;
}
