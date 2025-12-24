import type { AppId, AppType } from "@superego/backend";
import type { AppEntity } from "@superego/executing-backend";

// TODO: convert to type, remove as any from .all()
export default interface SqliteApp {
  id: AppId;
  type: AppType;
  name: string;
  /** ISO 8601 */
  created_at: string;
}

export function toEntity(app: SqliteApp): AppEntity {
  return {
    id: app.id,
    type: app.type,
    name: app.name,
    createdAt: new Date(app.created_at),
  };
}
