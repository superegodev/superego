import * as v from "valibot";

enum BackgroundJobName {
  ProcessConversation = "ProcessConversation",
  DownSyncCollection = "DownSyncCollection",
}
export default BackgroundJobName;

export const BackgroundJobNameSchema = v.enum(BackgroundJobName);
