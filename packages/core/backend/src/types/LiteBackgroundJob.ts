import type { DistributiveOmit } from "@superego/global-types";
import type BackgroundJob from "./BackgroundJob.js";

type LiteBackgroundJob = DistributiveOmit<BackgroundJob, "input" | "error">;
export default LiteBackgroundJob;
