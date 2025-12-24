-- Flexsearch indexes

CREATE TABLE "flexsearch_indexes" (
  "key" TEXT PRIMARY KEY NOT NULL,
  "target" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  CHECK ("target" IN ('document', 'conversation'))
);
