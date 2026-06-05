-- Collections

-- Add redirectToCollectionAfterDocumentCreation to collection settings,
-- defaulting to false for existing collections.

UPDATE "collections"
SET "settings" = json_set(
  "settings",
  '$.redirectToCollectionAfterDocumentCreation',
  json('false')
)
WHERE
  json_extract(
    "settings",
    '$.redirectToCollectionAfterDocumentCreation'
  ) IS NULL;
