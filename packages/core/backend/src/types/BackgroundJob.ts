import type BackgroundJobName from "../enums/BackgroundJobName.js";
import type BackgroundJobStatus from "../enums/BackgroundJobStatus.js";
import type BackgroundJobId from "../ids/BackgroundJobId.js";
import type ConversationId from "../ids/ConversationId.js";

type BaseBackgroundJob<Name extends BackgroundJobName, Input> = {
  id: BackgroundJobId;
  name: Name;
  input: Input;
  status: BackgroundJobStatus;
  enqueuedAt: Date;
  startedProcessingAt: Date | null;
  finishedProcessingAt: Date | null;
  error: { name: string; details: any } | null;
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
      error: { name: string; details: any };
    }
);

namespace BackgroundJob {
  export type ProcessConversation = BaseBackgroundJob<
    BackgroundJobName.ProcessConversation,
    { conversationId: ConversationId }
  >;
}

type BackgroundJob = BackgroundJob.ProcessConversation;

export default BackgroundJob;
