import type {
  BackgroundJobId,
  BackgroundJobName,
  BackgroundJobStatus,
} from "@superego/backend";
import type { BackgroundJobEntity } from "@superego/executing-backend";

export default interface SqliteBackgroundJob {
  id: BackgroundJobId;
  name: BackgroundJobName;
  /** JSON */
  input: string;
  status: BackgroundJobStatus;
  /** ISO8601 */
  enqueued_at: string;
  /** ISO8601 */
  started_processing_at: string | null;
  /** ISO8601 */
  finished_processing_at: string | null;
  /** JSON */
  error: string | null;
}

export function toEntity(
  backgroundJob: SqliteBackgroundJob,
): BackgroundJobEntity {
  return {
    id: backgroundJob.id,
    name: backgroundJob.name,
    input: JSON.parse(backgroundJob.input),
    status: backgroundJob.status,
    enqueuedAt: new Date(backgroundJob.enqueued_at),
    startedProcessingAt: backgroundJob.started_processing_at
      ? new Date(backgroundJob.started_processing_at)
      : null,
    finishedProcessingAt: backgroundJob.finished_processing_at
      ? new Date(backgroundJob.finished_processing_at)
      : null,
    error: backgroundJob.error ? JSON.parse(backgroundJob.error) : null,
  } as BackgroundJobEntity;
}
