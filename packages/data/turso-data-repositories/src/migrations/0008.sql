-- Document text search texts

CREATE TABLE "document_text_search_texts" (
  "document_id" TEXT PRIMARY KEY NOT NULL,
  "collection_id" TEXT NOT NULL,
  "text" TEXT NOT NULL
);

CREATE INDEX "idx__document_text_search_texts__collection_id" ON "document_text_search_texts" (
  "collection_id"
);

-- Conversation text search texts

CREATE TABLE "conversation_text_search_texts" (
  "conversation_id" TEXT PRIMARY KEY NOT NULL,
  "text" TEXT NOT NULL
);

-- Flexsearch indexes

DROP TABLE "flexsearch_indexes";

-- Document versions

ALTER TABLE "document_versions"
ADD COLUMN "content_summary" TEXT NOT NULL DEFAULT '{}';

CREATE INDEX "idx__document_versions__on__collection_version_id" ON "document_versions" (
  "collection_version_id"
);

-- Collection versions

-- Migrate content_blocking_keys_getter from a separate column into the settings
-- JSON column.

-- Step 1: Update the settings column to include contentBlockingKeysGetter.
UPDATE "collection_versions"
SET "settings" = json_set(
  "settings",
  '$.contentBlockingKeysGetter',
  CASE
    WHEN "content_blocking_keys_getter" IS NOT NULL THEN json(
      "content_blocking_keys_getter"
    )
    ELSE json('null')
  END
);

-- Step 2: Drop the old column.
ALTER TABLE "collection_versions" DROP COLUMN "content_blocking_keys_getter";
