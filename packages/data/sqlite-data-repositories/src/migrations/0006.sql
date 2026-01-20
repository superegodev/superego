-- Document versions

ALTER TABLE "document_versions"
ADD COLUMN "referenced_documents" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN "content_fingerprint" TEXT;

CREATE INDEX "idx__document_versions__on__collection_id__content_fingerprint" ON "document_versions" (
  "collection_id",
  "content_fingerprint"
)
WHERE "is_latest" = 1 AND "content_fingerprint" IS NOT NULL;

-- Collection versions

ALTER TABLE "collection_versions"
ADD COLUMN "content_fingerprint_getter" TEXT;
