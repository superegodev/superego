UPDATE "collection_versions"
SET "settings" = json_set(
  json_set(
    "settings",
    '$.contentSummaryGetter',
    json_extract("settings", '$.contentSummaryGetter.source')
  ),
  '$.contentBlockingKeysGetter',
  CASE
    WHEN json_type(
      "settings",
      '$.contentBlockingKeysGetter'
    ) = 'object' THEN json_extract(
      "settings",
      '$.contentBlockingKeysGetter.source'
    )
    ELSE json_extract("settings", '$.contentBlockingKeysGetter')
  END
)
WHERE
  json_type("settings", '$.contentSummaryGetter') = 'object'
  OR json_type("settings", '$.contentBlockingKeysGetter') = 'object';

UPDATE "collection_versions"
SET "migration" = json_quote(json_extract("migration", '$.source'))
WHERE "migration" IS NOT NULL AND json_type("migration") = 'object';
