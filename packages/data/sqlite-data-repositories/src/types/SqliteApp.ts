import { decode } from "@msgpack/msgpack";
import type { AppId, AppType } from "@superego/backend";
import type { AppEntity } from "@superego/executing-backend";

type SqliteApp = {
  id: AppId;
  state: Buffer;
  type: AppType;
  name: string;
  /** ISO 8601 */
  created_at: string;
};
export default SqliteApp;

export function toEntity(app: SqliteApp): AppEntity {
  return {
    id: app.id,
    state: decode(app.state) as AppEntity["state"],
    type: app.type,
    name: app.name,
    createdAt: new Date(app.created_at),
  };
}
