import type { DatabaseSync } from "node:sqlite";
import { encode } from "@msgpack/msgpack";

export default function moveAppPermissions(database: DatabaseSync) {
  const permissionsHex = Buffer.from(
    encode({ modals: false, downloads: false, http: { allowedOrigins: [] } }),
  ).toString("hex");
  database.exec(`
    ALTER TABLE "apps" ADD COLUMN "permissions" BLOB NOT NULL DEFAULT X'${permissionsHex}';
    UPDATE "apps"
    SET "permissions" = (
      SELECT "permissions" FROM "app_versions"
      WHERE "app_id" = "apps"."id" AND "is_latest" = 1
    )
    WHERE EXISTS (
      SELECT 1 FROM "app_versions"
      WHERE "app_id" = "apps"."id" AND "is_latest" = 1
    );
    ALTER TABLE "app_versions" DROP COLUMN "permissions";
  `);
}
