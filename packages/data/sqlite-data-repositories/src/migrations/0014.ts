import type { DatabaseSync } from "node:sqlite";
import { decode, encode } from "@msgpack/msgpack";

export default function migrateAppDefinitions(database: DatabaseSync) {
  const versions = database
    .prepare("SELECT id, definition_options FROM app_versions")
    .all() as { id: string; definition_options: Uint8Array }[];
  const updateVersion = database.prepare(
    "UPDATE app_versions SET definition_options = ? WHERE id = ?",
  );
  for (const version of versions) {
    const options = decode(version.definition_options) as {
      permissions?: {
        modals?: boolean;
        downloads?: boolean;
        http?: { allowedOrigins: string[] };
      };
      state: { schema: unknown; initialState: unknown; migration?: unknown };
    };
    updateVersion.run(
      encode({
        permissions: {
          modals: options.permissions?.modals ?? false,
          downloads: options.permissions?.downloads ?? false,
          http: options.permissions?.http ?? { allowedOrigins: [] },
        },
        stateDefinition: {
          ...options.state,
          migration: options.state.migration ?? null,
        },
      }),
      version.id,
    );
  }
}
