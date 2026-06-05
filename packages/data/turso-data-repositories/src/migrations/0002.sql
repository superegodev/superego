-- Collections

ALTER TABLE "collections"
ADD COLUMN "remote" BLOB;

-- Collection versions

ALTER TABLE "collection_versions"
ADD COLUMN "remote_converters" BLOB;

-- Documents

ALTER TABLE "documents"
ADD COLUMN "remote_id" TEXT;
ALTER TABLE "documents"
ADD COLUMN "remote_url" TEXT;
ALTER TABLE "documents"
ADD COLUMN "latest_remote_document" BLOB;

CREATE UNIQUE INDEX "idx__documents__on__collection_id_remote_id__unique" ON "documents" (
  "collection_id",
  "remote_id"
)
WHERE "remote_id" IS NOT NULL;

-- Document versions

ALTER TABLE "document_versions"
ADD COLUMN "remote_id" TEXT;
