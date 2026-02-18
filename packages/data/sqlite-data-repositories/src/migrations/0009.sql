-- Apps

ALTER TABLE "apps"
ADD COLUMN "settings" TEXT NOT NULL DEFAULT '{"alwaysCollapsePrimarySidebar":false}';
