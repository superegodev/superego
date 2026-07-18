import { decode } from "@msgpack/msgpack";
import type { AppId, AppVersionId } from "@superego/backend";
import type { AppVersionEntity } from "@superego/executing-backend";

type TursoAppVersion = {
  id: AppVersionId;
  previous_version_id: AppVersionId | null;
  app_id: AppId;
  /** MessagePack */
  target_collections: Uint8Array<ArrayBuffer>;
  /** MessagePack */
  files: Uint8Array<ArrayBuffer>;
  /** ISO 8601 */
  created_at: string;
  is_latest: 0 | 1;
};
export default TursoAppVersion;

export function toEntity(appVersion: TursoAppVersion): AppVersionEntity {
  return {
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
