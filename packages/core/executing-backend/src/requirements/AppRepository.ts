import type { AppId } from "@superego/backend";
import type AppEntity from "../entities/AppEntity.js";

export default interface AppRepository {
  insert(app: AppEntity): Promise<void>;
  replace(app: AppEntity): Promise<void>;
  delete(id: AppId): Promise<AppId>;
  find(id: AppId): Promise<AppEntity | null>;
  findAll(): Promise<AppEntity[]>;
}
