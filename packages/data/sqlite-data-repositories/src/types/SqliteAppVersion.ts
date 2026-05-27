import { decode } from "@msgpack/msgpack";
import type { AppId, AppVersionId } from "@superego/backend";
import type { AppVersionEntity } from "@superego/executing-backend";

type SqliteAppVersion = {
  id: AppVersionId;
  previous_version_id: AppVersionId | null;
  app_id: AppId;
  /** MessagePack */
  target_collections: Buffer;
  /** MessagePack */
  files: Buffer;
  /** ISO 8601 */
  created_at: string;
  is_latest: 0 | 1;
};
export default SqliteAppVersion;

export function toEntity(appVersion: SqliteAppVersion): AppVersionEntity {
  const files = decode(appVersion.files) as any;
  return {
    id: appVersion.id,
    previousVersionId: appVersion.previous_version_id,
    appId: appVersion.app_id,
    targetCollections: decode(
      appVersion.target_collections,
    ) as AppVersionEntity["targetCollections"],
    files: {
      "/main.tsx": toTypescriptModule(files["/main.tsx"]),
      "/main.js": toMainJs(files),
    },
    createdAt: new Date(appVersion.created_at),
  };
}

function toMainJs(files: Record<string, any>): string {
  if (typeof files["/main.js"] === "string") {
    return files["/main.js"];
  }
  if (
    typeof files["/main.tsx"] === "object" &&
    files["/main.tsx"] !== null &&
    typeof files["/main.tsx"].compiled === "string"
  ) {
    return files["/main.tsx"].compiled;
  }
  return "";
}

function toTypescriptModule(value: unknown): string {
  return typeof value === "object" &&
    value !== null &&
    "source" in value &&
    typeof value.source === "string"
    ? value.source
    : (value as string);
}
