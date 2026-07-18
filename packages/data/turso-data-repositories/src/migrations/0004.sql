-- Files

CREATE TABLE "files_new" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "referenced_by" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "content" BLOB NOT NULL,
  CHECK (json_valid("referenced_by"))
);

INSERT INTO "files_new"
  ("id", "referenced_by", "created_at", "content")
SELECT
  "id",
  json_array(
    json_object(
      'collectionId',
      "collection_id",
      'documentId',
      "document_id",
      'documentVersionId',
      "created_with_document_version_id"
    )
  ) AS "referenced_by",
  "created_at",
  "content"
FROM "files";

DROP TABLE "files";

ALTER TABLE "files_new" RENAME TO "files";
