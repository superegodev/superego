import {
  AppVersionFileUtils,
  type AppVersion,
  type ValidationIssue,
} from "@superego/backend";

export default function validateAppVersionDefinition(
  entrypoint: AppVersion["entrypoint"],
  files: AppVersion["files"],
  targetCollections: AppVersion["targetCollections"],
): ValidationIssue[] {
  const issues = AppVersionFileUtils.validateAppVersionFiles(entrypoint, files);
  const seenCollectionIds = new Set<string>();
  targetCollections.forEach((targetCollection, index) => {
    if (seenCollectionIds.has(targetCollection.id)) {
      issues.push({
        message: `Duplicate target collection: ${targetCollection.id}.`,
        path: [{ key: "targetCollections" }, { key: index }, { key: "id" }],
      });
    }
    seenCollectionIds.add(targetCollection.id);
  });
  return issues;
}
