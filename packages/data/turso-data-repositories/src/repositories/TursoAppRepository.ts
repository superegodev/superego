import type { AppId } from "@superego/backend";
import type { AppEntity, AppRepository } from "@superego/executing-backend";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoApp from "../types/TursoApp.js";
import { toEntity } from "../types/TursoApp.js";

const table = "apps";

export default class TursoAppRepository implements AppRepository {
  constructor(private db: TursoDatabase) {}

  async insert(app: AppEntity): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO "${table}"
          ("id", "type", "name", "created_at")
        VALUES
          (?, ?, ?, ?)
      `)
      .run(app.id, app.type, app.name, app.createdAt.toISOString());
  }

  async replace(app: AppEntity): Promise<void> {
    await this.db
      .prepare(`
        UPDATE "${table}"
        SET
          "type" = ?,
          "name" = ?,
          "created_at" = ?
        WHERE "id" = ?
      `)
      .run(app.type, app.name, app.createdAt.toISOString(), app.id);
  }

  async delete(id: AppId): Promise<AppId> {
    await this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async exists(id: AppId): Promise<boolean> {
    const result = (await this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id)) as 1 | undefined;
    return result !== undefined;
  }

  async find(id: AppId): Promise<AppEntity | null> {
    const app = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id)) as TursoApp | undefined;
    return app ? toEntity(app) : null;
  }

  async findAll(): Promise<AppEntity[]> {
    const apps = (await this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "name" ASC`)
      .all()) as TursoApp[];
    return apps.map(toEntity);
  }
}
