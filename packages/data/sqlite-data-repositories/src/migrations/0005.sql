-- Flexsearch indexes

CREATE TABLE "flexsearch_indexes" (
  "key" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  PRIMARY KEY ("key", "target"),
  CHECK ("target" IN ('document', 'conversation'))
);
