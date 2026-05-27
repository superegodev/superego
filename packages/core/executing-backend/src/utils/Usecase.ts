import { BackgroundJobStatus } from "@superego/backend";
import type { DistributivePick, ResultPromise } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import type Config from "../Config.js";
import type BackgroundJobEntity from "../entities/BackgroundJobEntity.js";
import type LiveConversationStore from "../LiveConversationStore.js";
import type DataRepositories from "../requirements/DataRepositories.js";
import type InferenceServiceFactory from "../requirements/InferenceServiceFactory.js";
import type TypescriptCompiler from "../requirements/TypescriptCompiler.js";
import type TypescriptSandbox from "../requirements/TypescriptSandbox.js";

/**
 * Base class for all usecases. Holds the common constructor and helper methods.
 * Usecases exposed via the public `Backend` interface should extend
 * `BackendUsecase` instead, which adds the abstract `argumentsSchema` and
 * `resultSchema` properties used by `ExecutingBackend` for RPC-boundary
 * validation. Extend `Usecase` directly only for internal usecases, i.e., the
 * ones invoked via `sub()` or by the background-job runner, never through the
 * public `Backend` interface.
 */
export default abstract class Usecase<
  Exec extends (...args: any[]) => ResultPromise<any, any> = (
    ...args: any[]
  ) => ResultPromise<any, any>,
> {
  constructor(
    protected repos: DataRepositories,
    protected typescriptSandbox: TypescriptSandbox,
    protected typescriptCompiler: TypescriptCompiler,
    protected inferenceServiceFactory: InferenceServiceFactory,
    protected liveConversationStore: LiveConversationStore,
    protected config: Config,
  ) {}

  abstract exec(...args: Parameters<Exec>): ReturnType<Exec>;

  protected sub<
    SubUsecase extends new (
      repos: DataRepositories,
      typescriptSandbox: TypescriptSandbox,
      typescriptCompiler: TypescriptCompiler,
      inferenceServiceFactory: InferenceServiceFactory,
      liveConversationStore: LiveConversationStore,
      config: Config,
    ) => Usecase,
  >(UsecaseClass: SubUsecase): InstanceType<SubUsecase> {
    return new UsecaseClass(
      this.repos,
      this.typescriptSandbox,
      this.typescriptCompiler,
      this.inferenceServiceFactory,
      this.liveConversationStore,
      this.config,
    ) as InstanceType<SubUsecase>;
  }

  protected async enqueueBackgroundJob(
    protoBackgroundJob: DistributivePick<BackgroundJobEntity, "name" | "input">,
  ): Promise<void> {
    await this.repos.backgroundJob.insert({
      ...protoBackgroundJob,
      id: Id.generate.backgroundJob(),
      status: BackgroundJobStatus.Enqueued,
      enqueuedAt: new Date(),
      startedProcessingAt: null,
      finishedProcessingAt: null,
      error: null,
    });
  }
}
