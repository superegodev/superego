-- Apps

CREATE TABLE "apps" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

-- App versions

CREATE TABLE "app_versions" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "previous_version_id" TEXT,
  "app_id" TEXT NOT NULL,
  "target_collections" BLOB NOT NULL,
  "files" BLOB NOT NULL,
  "created_at" TEXT NOT NULL,
  "is_latest" INTEGER NOT NULL,
  FOREIGN KEY ("previous_version_id") REFERENCES "app_versions" ("id"),
  FOREIGN KEY ("app_id") REFERENCES "apps" ("id")
);

CREATE INDEX "idx__app_versions__on__app_id" ON "app_versions" ("app_id");

CREATE INDEX "idx__app_versions__on__is_latest" ON "app_versions" ("is_latest");

CREATE UNIQUE INDEX "idx__app_versions__on__app_id__unique_is_latest_true" ON "app_versions" (
  "app_id"
)
WHERE "is_latest" = 1;

-- Collections

UPDATE "collections"
SET "settings" = json_set("settings", '$.defaultCollectionViewAppId', NULL);
