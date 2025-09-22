import type { BackgroundJob } from "@superego/backend";
import type BackgroundJobEntity from "../entities/BackgroundJobEntity.js";

export default function makeBackgroundJob(
  backgroundJob: BackgroundJobEntity,
): BackgroundJob {
  return { ...backgroundJob };
}
