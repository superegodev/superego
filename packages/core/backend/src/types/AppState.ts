import type AppVersionId from "../ids/AppVersionId.js";

export default interface AppState<Content = Record<string, unknown>> {
  content: Content;
  revision: number;
  /** Version that established this schema context; stable across code updates. */
  schemaId: AppVersionId;
}
