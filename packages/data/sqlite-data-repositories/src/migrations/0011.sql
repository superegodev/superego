ALTER TABLE "app_versions"
ADD COLUMN "entrypoint" TEXT NOT NULL DEFAULT '/dist/index.html';
