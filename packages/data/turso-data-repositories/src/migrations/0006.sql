-- Collection versions

ALTER TABLE "collection_versions"
ADD COLUMN "content_blocking_keys_getter" TEXT;

-- Document versions

ALTER TABLE "document_versions"
ADD COLUMN "referenced_documents" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "document_versions"
ADD COLUMN "content_blocking_keys" TEXT;

-- Document version blocking keys. This is a lookup table used purely as an
-- index for fast blocking key searches.

CREATE TABLE "document_version_content_blocking_keys" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "document_version_id" TEXT NOT NULL,
  "collection_id" TEXT NOT NULL,
  "blocking_key" TEXT NOT NULL,
  FOREIGN KEY ("document_version_id") REFERENCES "document_versions" ("id")
    ON DELETE CASCADE
);

-- Index for duplicate detection: find any document with matching key in
-- collection.
CREATE INDEX "idx__document_version_content_blocking_keys__collection_id__blocking_key" ON "document_version_content_blocking_keys" (
  "collection_id",
  "blocking_key"
);

-- Index for cleanup when deleting document versions.
CREATE INDEX "idx__document_version_content_blocking_keys__document_version_id" ON "document_version_content_blocking_keys" (
  "document_version_id"
);
