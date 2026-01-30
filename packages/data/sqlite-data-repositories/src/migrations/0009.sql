-- Document versions

ALTER TABLE "document_versions"
ADD COLUMN "content_summary" TEXT NOT NULL DEFAULT '{}';

CREATE INDEX "idx__document_versions__on__collection_version_id" ON "document_versions" (
  "collection_version_id"
);
