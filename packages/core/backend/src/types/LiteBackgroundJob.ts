import type BackgroundJob from "./BackgroundJob.js";

type LiteBackgroundJob = Omit<BackgroundJob, "input" | "error">;
export default LiteBackgroundJob;
