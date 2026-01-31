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
