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
