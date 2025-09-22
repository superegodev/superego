import type { BackgroundJobId, BackgroundJobStatus } from "@superego/backend";
import type BackgroundJobEntity from "../entities/BackgroundJobEntity.js";

export default interface BackgroundJobRepository {
  insert(backgroundJob: BackgroundJobEntity): Promise<void>;
  replace(backgroundJob: BackgroundJobEntity): Promise<void>;
  find(id: BackgroundJobId): Promise<BackgroundJobEntity | null>;
  findWhereStatusEqProcessing(): Promise<
    (BackgroundJobEntity & { status: BackgroundJobStatus.Processing }) | null
  >;
  findOldestWhereStatusEqEnqueued(): Promise<
    (BackgroundJobEntity & { status: BackgroundJobStatus.Enqueued }) | null
  >;
  findAll(): Promise<BackgroundJobEntity[]>;
}
