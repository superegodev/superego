import {
  BackgroundJobStatus,
  type Contract,
  type ResultOf,
} from "@superego/backend";
import type { DistributivePick } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import type * as v from "valibot";
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
 * Base class for all usecases. Each usecase declares the contract it
 * implements as the type parameter; the contract drives both compile-time
 * checking of `exec` (its argument and return types) and the runtime
 * structural validation performed by `ExecutingBackend.makeUsecase`.
 *
 * Note on argument asymmetry: `exec` may declare more parameters than the
 * contract's `argumentsSchema` exposes — the extras are accessible only when
 * the usecase is invoked internally via `this.sub(...)` (which bypasses
 * structural validation). External callers (via `Backend`) only see the
 * contract-declared arguments.
 */
export default abstract class Usecase<C extends Contract = Contract> {
  constructor(
    protected repos: DataRepositories,
    protected javascriptSandbox: JavascriptSandbox,
    protected typescriptCompiler: TypescriptCompiler,
    protected inferenceServiceFactory: InferenceServiceFactory,
    protected connectors: Connector[],
    protected liveConversationStore: LiveConversationStore,
    protected config: Config,
  ) {}

  abstract exec(
    ...args: v.InferInput<C["argumentsSchema"]> extends infer A
      ? A extends readonly unknown[]
        ? A
        : never
      : never
  ): Promise<ResultOf<C>>;

  protected sub<
    SubUsecase extends new (
      repos: DataRepositories,
      javascriptSandbox: JavascriptSandbox,
      typescriptCompiler: TypescriptCompiler,
      inferenceServiceFactory: InferenceServiceFactory,
      connectors: Connector[],
      liveConversationStore: LiveConversationStore,
      config: Config,
    ) => Usecase<any>,
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
