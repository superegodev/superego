import * as v from "valibot";

enum BackgroundJobStatus {
  Enqueued = "Enqueued",
  Processing = "Processing",
  Succeeded = "Succeeded",
  Failed = "Failed",
}
export default BackgroundJobStatus;

export const BackgroundJobStatusSchema = v.enum(BackgroundJobStatus);
