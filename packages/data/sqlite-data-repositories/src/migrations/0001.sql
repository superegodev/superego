-- Conversations

CREATE TABLE "conversations" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "assistant" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "context_fingerprint" TEXT NOT NULL,
  "messages" TEXT NOT NULL,
  "is_completed" INTEGER NOT NULL,
  "created_at" TEXT NOT NULL,
  CHECK (json_valid("messages"))
);
