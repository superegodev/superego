import type { ResultError } from "@superego/global-types";
import type BackgroundJobName from "../enums/BackgroundJobName.js";
import type BackgroundJobStatus from "../enums/BackgroundJobStatus.js";
import type BackgroundJobId from "../ids/BackgroundJobId.js";
import type CollectionId from "../ids/CollectionId.js";
import type ConversationId from "../ids/ConversationId.js";

type BaseBackgroundJob<Name extends BackgroundJobName, Input> = {
  id: BackgroundJobId;
  name: Name;
  input: Input;
  status: BackgroundJobStatus;
  enqueuedAt: Date;
  startedProcessingAt: Date | null;
  finishedProcessingAt: Date | null;
  error: ResultError<any, any> | null;
} & (
  | {
      status: BackgroundJobStatus.Enqueued;
      startedProcessingAt: null;
      finishedProcessingAt: null;
      error: null;
    }
  | {
      status: BackgroundJobStatus.Processing;
      startedProcessingAt: Date;
      finishedProcessingAt: null;
      error: null;
    }
  | {
      status: BackgroundJobStatus.Succeeded;
      startedProcessingAt: Date;
      finishedProcessingAt: Date;
      error: null;
    }
  | {
      status: BackgroundJobStatus.Failed;
      startedProcessingAt: Date;
      finishedProcessingAt: Date;
      error: ResultError<any, any>;
    }
);

namespace BackgroundJob {
  export type ProcessConversation = BaseBackgroundJob<
    BackgroundJobName.ProcessConversation,
    { id: ConversationId }
  >;

  export type DownSyncCollection = BaseBackgroundJob<
    BackgroundJobName.DownSyncCollection,
    { id: CollectionId }
  >;
}

type BackgroundJob =
  | BackgroundJob.ProcessConversation
  | BackgroundJob.DownSyncCollection;

export default BackgroundJob;
