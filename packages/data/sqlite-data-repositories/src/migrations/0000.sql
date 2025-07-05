-- Collection categories

CREATE TABLE "collection_categories" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "icon" TEXT,
  "parent_id" TEXT,
  "created_at" TEXT NOT NULL,
  FOREIGN KEY ("parent_id") REFERENCES "collection_categories" ("id")
);

CREATE INDEX "idx__collection_categories__on__parent_id" ON "collection_categories" (
  "parent_id"
);

-- Collections

CREATE TABLE "collections" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "settings" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  CHECK (json_valid("settings"))
);

CREATE INDEX "idx__collections__on__settings_collection_category_id" ON "collections" (
  "settings" ->> '$.collectionCategoryId'
);

-- Collection versions

CREATE TABLE "collection_versions" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "previous_version_id" TEXT,
  "collection_id" TEXT NOT NULL,
  "schema" TEXT NOT NULL,
  "settings" TEXT NOT NULL,
  "migration" TEXT,
  "created_at" TEXT NOT NULL,
  "is_latest" INTEGER NOT NULL,
  FOREIGN KEY ("previous_version_id") REFERENCES "collection_versions" ("id"),
  FOREIGN KEY ("collection_id") REFERENCES "collections" ("id"),
  CHECK (json_valid("schema")),
  CHECK (json_valid("settings")),
  CHECK (json_valid("migration"))
);

CREATE INDEX "idx__collection_versions__on__collection_id" ON "collection_versions" (
  "collection_id"
);

CREATE INDEX "idx__collection_versions__on__is_latest" ON "collection_versions" (
  "is_latest"
);

CREATE UNIQUE INDEX "idx__collection_versions__on__collection_id__unique_is_latest_true" ON "collection_versions" (
  "collection_id"
)
WHERE "is_latest" = 1;

-- Documents

CREATE TABLE "documents" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "collection_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  FOREIGN KEY ("collection_id") REFERENCES "collections" ("id")
);

CREATE INDEX "idx__documents__on__collection_id" ON "documents" (
  "collection_id"
);

-- Document versions

CREATE TABLE "document_versions" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "previous_version_id" TEXT,
  "collection_id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "collection_version_id" TEXT NOT NULL,
  "content_delta" TEXT,
  "content_snapshot" TEXT,
  "created_at" TEXT NOT NULL,
  "is_latest" INTEGER NOT NULL,
  FOREIGN KEY ("previous_version_id") REFERENCES "document_versions" ("id"),
  FOREIGN KEY ("collection_id") REFERENCES "collections" ("id"),
  FOREIGN KEY ("document_id") REFERENCES "documents" ("id"),
  FOREIGN KEY ("collection_version_id") REFERENCES "collection_versions" ("id"),
  CHECK (json_valid("content_delta")),
  CHECK (json_valid("content_snapshot"))
);

CREATE INDEX "idx__document_versions__on__collection_id" ON "document_versions" (
  "collection_id"
);

CREATE INDEX "idx__document_versions__on__document_id" ON "document_versions" (
  "document_id"
);

CREATE INDEX "idx__document_versions__on__is_latest" ON "document_versions" (
  "is_latest"
);

CREATE INDEX "idx__document_versions__on__collection_id__is_latest_true" ON "document_versions" (
  "collection_id"
)
WHERE "is_latest" = 1;

CREATE UNIQUE INDEX "idx__document_versions__on__document_id__unique_is_latest_true" ON "document_versions" (
  "document_id"
)
WHERE "is_latest" = 1;

-- Files

CREATE TABLE "files" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "collection_id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "created_with_document_version_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "content" BLOB NOT NULL,
  FOREIGN KEY ("collection_id") REFERENCES "collections" ("id"),
  FOREIGN KEY ("document_id") REFERENCES "documents" ("id"),
  FOREIGN KEY (
    "created_with_document_version_id"
  ) REFERENCES "document_versions" ("id")
);

CREATE INDEX "idx__files__on__collection_id" ON "files" ("collection_id");

CREATE INDEX "idx__files__on__document_id" ON "files" ("document_id");

-- Global settings

CREATE TABLE "singleton__global_settings" (
  "id" TEXT PRIMARY KEY DEFAULT 'singleton' NOT NULL,
  "value" TEXT NOT NULL,
  CHECK ("id" = 'singleton')
);
