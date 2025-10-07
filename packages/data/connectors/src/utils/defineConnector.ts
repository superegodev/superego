import type { Connector } from "@superego/executing-backend";
import type { Schema } from "@superego/schema";

export default function defineConnector<
  const SettingsSchema extends Schema,
  const RemoteDocumentSchema extends Schema,
>(
  connector: Connector<SettingsSchema, RemoteDocumentSchema>,
): Connector<SettingsSchema, RemoteDocumentSchema> {
  return connector;
}
