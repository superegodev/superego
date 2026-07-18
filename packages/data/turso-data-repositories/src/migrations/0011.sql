DELETE FROM "background_jobs"
WHERE "name" = 'DownSyncCollection';

UPDATE "document_versions"
SET "created_by" = 'User'
WHERE "created_by" = 'Connector';

DROP INDEX "idx__documents__on__collection_id_remote_id__unique";

ALTER TABLE "collections" DROP COLUMN "remote";

ALTER TABLE "collection_versions" DROP COLUMN "remote_converters";

ALTER TABLE "documents" DROP COLUMN "remote_id";
ALTER TABLE "documents" DROP COLUMN "remote_url";
ALTER TABLE "documents" DROP COLUMN "latest_remote_document";

ALTER TABLE "document_versions" DROP COLUMN "remote_id";
