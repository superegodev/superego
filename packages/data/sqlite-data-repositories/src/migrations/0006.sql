-- Document versions

ALTER TABLE "document_versions"
ADD COLUMN "referenced_documents" TEXT NOT NULL DEFAULT '[]';
