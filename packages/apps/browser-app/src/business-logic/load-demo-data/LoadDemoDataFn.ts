import type LoadDemoDataProgress from "./LoadDemoDataProgress.js";

type LoadDemoDataFn = (
  onProgress: (progress: LoadDemoDataProgress) => void,
) => Promise<void>;
export default LoadDemoDataFn;
