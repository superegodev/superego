import type { AppId, AppSettings, AppType } from "@superego/backend";
import type { AppEntity } from "@superego/executing-backend";

type SqliteApp = {
  id: AppId;
  type: AppType;
  name: string;
  /** JSON */
  settings: string;
  /** ISO 8601 */
  created_at: string;
};
export default SqliteApp;

export function toEntity(app: SqliteApp): AppEntity {
  return {
    id: app.id,
    type: app.type,
    name: app.name,
    settings: JSON.parse(app.settings) as AppSettings,
    createdAt: new Date(app.created_at),
  };
}
