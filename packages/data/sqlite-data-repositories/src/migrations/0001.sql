-- Conversations

CREATE TABLE "conversations" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "assistant" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "context_fingerprint" TEXT NOT NULL,
  "messages" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "error" TEXT,
  "created_at" TEXT NOT NULL,
  CHECK (json_valid("messages")),
  CHECK (json_valid("error"))
);

-- Background jobs

CREATE TABLE "background_jobs" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "input" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "enqueued_at" TEXT NOT NULL,
  "started_processing_at" TEXT,
  "finished_processing_at" TEXT,
  "error" TEXT,
  CHECK (json_valid("input")),
  CHECK (json_valid("error"))
);

CREATE UNIQUE INDEX "idx__background_jobs__on__status__unique_status_processing" ON "background_jobs" (
  "status"
)
WHERE "status" = 'Processing';

CREATE INDEX "idx__background_jobs__on__enqueued_at__status_enqueued" ON "background_jobs" (
  "enqueued_at"
)
WHERE "status" = 'Enqueued';
