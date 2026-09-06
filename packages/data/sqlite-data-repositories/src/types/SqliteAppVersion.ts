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
  definition_options: Buffer;
  is_latest: 0 | 1;
};
export default SqliteAppVersion;

export function toEntity(appVersion: SqliteAppVersion): AppVersionEntity {
  const options = decode(appVersion.definition_options) as Pick<
    AppVersionEntity,
    "permissions" | "stateDefinition"
  >;
  return {
    permissions: options.permissions,
    stateDefinition: options.stateDefinition,
    id: appVersion.id,
    previousVersionId: appVersion.previous_version_id,
    appId: appVersion.app_id,
    targetCollections: decode(
      appVersion.target_collections,
    ) as AppVersionEntity["targetCollections"],
    files: decode(appVersion.files) as AppVersionEntity["files"],
    createdAt: new Date(appVersion.created_at),
  };
}
