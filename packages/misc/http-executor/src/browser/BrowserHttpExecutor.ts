import type { HttpExecutor } from "@superego/executing-backend";
import executeBrowserHttpRequest from "./executeBrowserHttpRequest.js";

export default class BrowserHttpExecutor implements HttpExecutor {
  execute = executeBrowserHttpRequest;
}
