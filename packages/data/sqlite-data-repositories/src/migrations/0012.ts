import type { DatabaseSync } from "node:sqlite";
import { encode } from "@msgpack/msgpack";

export default function migrateAppDefinitions(database: DatabaseSync) {
  database.exec(`
    ALTER TABLE "apps" ADD COLUMN "state" BLOB;
    ALTER TABLE "app_versions" ADD COLUMN "definition_options" BLOB;
  `);
  database
    .prepare("UPDATE apps SET state = ?")
    .run(encode({ content: {}, revision: 1 }));
  database.prepare("UPDATE app_versions SET definition_options = ?").run(
    encode({
      permissions: {
        modals: false,
        downloads: false,
        http: { allowedOrigins: [] },
      },
      stateDefinition: {
        schema: {
          types: { State: { dataType: "Struct", properties: {} } },
          rootType: "State",
        },
        initialState: {},
        migration: null,
      },
    }),
  );
}
