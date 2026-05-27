import { BackgroundJobName, BackgroundJobStatus } from "@superego/backend";
import { extractErrorDetails } from "@superego/shared-utils";
import type Config from "./Config.js";
import type BackgroundJobEntity from "./entities/BackgroundJobEntity.js";
import type LiveConversationStore from "./LiveConversationStore.js";
import makeResultError from "./makers/makeResultError.js";
import type DataRepositoriesManager from "./requirements/DataRepositoriesManager.js";
import type InferenceServiceFactory from "./requirements/InferenceServiceFactory.js";
import type TypescriptCompiler from "./requirements/TypescriptCompiler.js";
import type TypescriptSandbox from "./requirements/TypescriptSandbox.js";
import AssistantsProcessConversation from "./usecases/assistants/ProcessConversation.js";

export default class BackgroundJobExecutor {
  constructor(
    private dataRepositoriesManager: DataRepositoriesManager,
    private typescriptSandbox: TypescriptSandbox,
    private typescriptCompiler: TypescriptCompiler,
    private inferenceServiceFactory: InferenceServiceFactory,
    private liveConversationStore: LiveConversationStore,
    private config: Config,
  ) {}

  async executeNext(): Promise<void> {
    const backgroundJob = await this.lockAndGetNext();
    if (!backgroundJob) {
      return;
    }

    const UsecaseClass = {
      [BackgroundJobName.ProcessConversation]: AssistantsProcessConversation,
    }[backgroundJob.name];

    await this.dataRepositoriesManager
      .runInSerializableTransaction(async (repos) => {
        const usecase = new UsecaseClass(
          repos,
          this.typescriptSandbox,
          this.typescriptCompiler,
          this.inferenceServiceFactory,
          this.liveConversationStore,
          this.config,
        );

        const beforeExecSavepoint = await repos.createSavepoint();
        // Typed `as any` since TypeScript can't understand that the class
        // matches the input.
        const result = await usecase.exec(backgroundJob.input as any);

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
            this.config.backgroundJobProcessingStuckTimeout
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
