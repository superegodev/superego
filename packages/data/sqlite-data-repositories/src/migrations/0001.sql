-- Conversations

CREATE TABLE "conversations" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT,
  "messages" TEXT NOT NULL,
  "is_generating_next_message" INTEGER NOT NULL,
  "next_message_generation_error" TEXT,
  "created_at" TEXT NOT NULL,
  CHECK (json_valid("messages"))
);
