import type { LiteBackgroundJob } from "@superego/backend";
import type BackgroundJobEntity from "../entities/BackgroundJobEntity.js";

export default function makeLiteBackgroundJob(
  backgroundJob: BackgroundJobEntity,
): LiteBackgroundJob {
  const { input, error, ...rest } = backgroundJob;
  return rest;
}
