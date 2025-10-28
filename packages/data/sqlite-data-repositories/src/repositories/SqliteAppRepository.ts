import type { DatabaseSync } from "node:sqlite";
import type { AppId } from "@superego/backend";
import type { AppEntity, AppRepository } from "@superego/executing-backend";
import type SqliteApp from "../types/SqliteApp.js";
import { toEntity } from "../types/SqliteApp.js";

const table = "apps";

export default class SqliteAppRepository implements AppRepository {
  constructor(private db: DatabaseSync) {}

  async insert(app: AppEntity): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO "${table}"
          ("id", "type", "name", "created_at")
        VALUES
          (?, ?, ?, ?)
      `)
      .run(app.id, app.type, app.name, app.createdAt.toISOString());
  }

  async replace(app: AppEntity): Promise<void> {
    this.db
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
    this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async exists(id: AppId): Promise<boolean> {
    const result = this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id) as 1 | undefined;
    return result !== undefined;
  }

  async find(id: AppId): Promise<AppEntity | null> {
    const app = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id) as SqliteApp | undefined;
    return app ? toEntity(app) : null;
  }

  async findAll(): Promise<AppEntity[]> {
    const apps = this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "name" ASC`)
      .all() as any as SqliteApp[];
    return apps.map(toEntity);
  }
}
