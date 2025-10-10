import type { Connector } from "@superego/executing-backend";
import type { Schema } from "@superego/schema";

/**
 * Utility function to get automatic type definitions when defining the
 * connector.
 */
export default function defineConnector<
  Options,
  const SettingsSchema extends Schema,
  const RemoteDocumentSchema extends Schema,
>(
  connectorGetter: (
    options: Options,
  ) => Connector<SettingsSchema, RemoteDocumentSchema>,
): (options: Options) => Connector {
  return connectorGetter as any;
}
