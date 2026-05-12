import { BackgroundJobStatus } from "@superego/backend";
import type { DistributivePick, ResultPromise } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import type Config from "../Config.js";
import type BackgroundJobEntity from "../entities/BackgroundJobEntity.js";
import type CollectionEntity from "../entities/CollectionEntity.js";
import type LiveConversationStore from "../LiveConversationStore.js";
import type Connector from "../requirements/Connector.js";
import type DataRepositories from "../requirements/DataRepositories.js";
import type InferenceServiceFactory from "../requirements/InferenceServiceFactory.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import type TypescriptCompiler from "../requirements/TypescriptCompiler.js";

/**
 * Shared base for `Usecase` and `InternalUsecase`. Holds the common
 * constructor and helper methods. Not meant to be extended directly outside
 * of those two classes.
 */
export default abstract class BaseUsecase<
  Exec extends (...args: any[]) => ResultPromise<any, any> = (
    ...args: any[]
  ) => ResultPromise<any, any>,
> {
  constructor(
    protected repos: DataRepositories,
    protected javascriptSandbox: JavascriptSandbox,
    protected typescriptCompiler: TypescriptCompiler,
    protected inferenceServiceFactory: InferenceServiceFactory,
    protected connectors: Connector[],
    protected liveConversationStore: LiveConversationStore,
    protected config: Config,
  ) {}

  abstract exec(...args: Parameters<Exec>): ReturnType<Exec>;

  protected sub<
    SubUsecase extends new (
      repos: DataRepositories,
      javascriptSandbox: JavascriptSandbox,
      typescriptCompiler: TypescriptCompiler,
      inferenceServiceFactory: InferenceServiceFactory,
      connectors: Connector[],
      liveConversationStore: LiveConversationStore,
      config: Config,
    ) => BaseUsecase,
  >(UsecaseClass: SubUsecase): InstanceType<SubUsecase> {
    return new UsecaseClass(
      this.repos,
      this.javascriptSandbox,
      this.typescriptCompiler,
      this.inferenceServiceFactory,
      this.connectors,
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

  protected getConnector(
    collectionOrName: CollectionEntity | string,
  ): Connector | null {
    const connectorName =
      typeof collectionOrName !== "string"
        ? (collectionOrName.remote?.connector.name ?? null)
        : collectionOrName;
    return connectorName !== null
      ? (this.connectors.find(({ name }) => name === connectorName) ?? null)
      : null;
  }
}
