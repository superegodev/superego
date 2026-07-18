import type { AppId, AppType } from "@superego/backend";
import type { AppEntity } from "@superego/executing-backend";

type TursoApp = {
  id: AppId;
  type: AppType;
  name: string;
  /** ISO 8601 */
  created_at: string;
};
export default TursoApp;

export function toEntity(app: TursoApp): AppEntity {
  return {
    id: app.id,
    type: app.type,
    name: app.name,
    createdAt: new Date(app.created_at),
  };
}
