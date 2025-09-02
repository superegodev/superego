import { BackgroundJobName, BackgroundJobStatus } from "@superego/backend";
import { extractErrorDetails } from "@superego/shared-utils";
import type BackgroundJobEntity from "./entities/BackgroundJobEntity.js";
import makeResultError from "./makers/makeResultError.js";
import type DataRepositoriesManager from "./requirements/DataRepositoriesManager.js";
import type InferenceServiceFactory from "./requirements/InferenceServiceFactory.js";
import type JavascriptSandbox from "./requirements/JavascriptSandbox.js";
import AssistantProcessConversation from "./usecases/assistant/ProcessConversation.js";
import type Millisecond from "./utils/Millisecond.js";

export default class BackgroundJobExecutor {
  constructor(
    private dataRepositoriesManager: DataRepositoriesManager,
    private javascriptSandbox: JavascriptSandbox,
    private inferenceServiceFactory: InferenceServiceFactory,
    private stuckJobTimeout: Millisecond = 5 * 60 * 1000,
  ) {}

  async executeNext(): Promise<void> {
    const backgroundJob = await this.lockAndGetNext();
    if (!backgroundJob) {
      return;
    }

    const UsecaseClass = {
      [BackgroundJobName.ProcessConversation]: AssistantProcessConversation,
    }[backgroundJob.name];

    await this.dataRepositoriesManager
      .runInSerializableTransaction(async (repos) => {
        const usecase = new UsecaseClass(
          repos,
          this.javascriptSandbox,
          this.inferenceServiceFactory,
        );

        const beforeExecSavepoint = await repos.createSavepoint();
        const result = await usecase.exec(backgroundJob.input);

        if (result.success) {
          await repos.backgroundJob.replace({
            ...backgroundJob,
            status: BackgroundJobStatus.Succeeded,
            finishedProcessingAt: new Date(),
            error: null,
          });
        } else {
          await repos.rollbackToSavepoint(beforeExecSavepoint);
          await repos.backgroundJob.replace({
            ...backgroundJob,
            status: BackgroundJobStatus.Failed,
            finishedProcessingAt: new Date(),
            error: result.error,
          });
        }

        return { action: "commit", returnValue: null };
      })
      .catch((error) =>
        this.dataRepositoriesManager.runInSerializableTransaction(
          async (repos) => {
            await repos.backgroundJob.replace({
              ...backgroundJob,
              status: BackgroundJobStatus.Failed,
              finishedProcessingAt: new Date(),
              error: makeResultError("UnexpectedError", {
                cause: extractErrorDetails(error),
              }),
            });
            return { action: "commit", returnValue: null };
          },
        ),
      )
      .finally(() => this.executeNext());
  }

  private async lockAndGetNext(): Promise<
    (BackgroundJobEntity & { status: BackgroundJobStatus.Processing }) | null
  > {
    return await this.dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        const processingBackgroundJob =
          await repos.backgroundJob.findWhereStatusEqProcessing();
        if (processingBackgroundJob) {
          if (
            Date.now() - processingBackgroundJob.startedProcessingAt.getTime() <
            this.stuckJobTimeout
          ) {
            return { action: "commit", returnValue: null };
          }
          await repos.backgroundJob.replace({
            ...processingBackgroundJob,
            status: BackgroundJobStatus.Failed,
            finishedProcessingAt: new Date(),
            error: makeResultError("StuckProcessing", null),
          });
        }

        const backgroundJob =
          await repos.backgroundJob.findOldestWhereStatusEqEnqueued();

        if (!backgroundJob) {
          return { action: "commit", returnValue: null };
        }

        const updatedBackgroundJob: BackgroundJobEntity = {
          ...backgroundJob,
          status: BackgroundJobStatus.Processing,
          startedProcessingAt: new Date(),
          finishedProcessingAt: null,
          error: null,
        };

        await repos.backgroundJob.replace(updatedBackgroundJob);

        return { action: "commit", returnValue: updatedBackgroundJob };
      },
    );
  }
}
