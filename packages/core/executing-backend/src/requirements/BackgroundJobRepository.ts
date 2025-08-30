import type { BackgroundJobId } from "@superego/backend";
import type BackgroundJobEntity from "../entities/BackgroundJobEntity.js";

export default interface BackgroundJobRepository {
  insert(backgroundJob: BackgroundJobEntity): Promise<void>;
  replace(backgroundJob: BackgroundJobEntity): Promise<void>;
  find(id: BackgroundJobId): Promise<BackgroundJobEntity | null>;
  findAll(): Promise<BackgroundJobEntity[]>;
}
