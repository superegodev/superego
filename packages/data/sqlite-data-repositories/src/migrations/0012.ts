import type { DatabaseSync } from "node:sqlite";
import { encode } from "@msgpack/msgpack";

export default function migrateAppDefinitions(database: DatabaseSync) {
  const initialStateHex = Buffer.from(
    encode({ content: {}, revision: 1 }),
  ).toString("hex");
  const permissionsHex = Buffer.from(
    encode({
      modals: false,
      downloads: false,
      http: { allowedOrigins: [] },
    }),
  ).toString("hex");
  const stateDefinitionHex = Buffer.from(
    encode({
      schema: {
        types: { State: { dataType: "Struct", properties: {} } },
        rootType: "State",
      },
      initialState: {},
      migration: null,
    }),
  ).toString("hex");
  database.exec(`
    ALTER TABLE "apps" ADD COLUMN "state" BLOB NOT NULL DEFAULT X'${initialStateHex}';
    ALTER TABLE "app_versions" ADD COLUMN "permissions" BLOB NOT NULL DEFAULT X'${permissionsHex}';
    ALTER TABLE "app_versions" ADD COLUMN "state_definition" BLOB NOT NULL DEFAULT X'${stateDefinitionHex}';
  `);
}
