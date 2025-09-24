import {
  type BackgroundJob,
  type BackgroundJobName,
  BackgroundJobStatus,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import type BackgroundJobEntity from "../entities/BackgroundJobEntity.js";
import type DataRepositories from "../requirements/DataRepositories.js";
import type InferenceServiceFactory from "../requirements/InferenceServiceFactory.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";

export default abstract class Usecase<
  Exec extends (...args: any[]) => ResultPromise<any, any> = (
    ...args: any[]
  ) => ResultPromise<any, any>,
> {
  constructor(
    protected repos: DataRepositories,
    protected javascriptSandbox: JavascriptSandbox,
    protected inferenceServiceFactory: InferenceServiceFactory,
  ) {}

  abstract exec(...args: Parameters<Exec>): ReturnType<Exec>;

  protected sub<SubUsecase extends new (...args: any[]) => Usecase>(
    UsecaseClass: SubUsecase,
  ): InstanceType<SubUsecase> {
    return new UsecaseClass(
      this.repos,
      this.javascriptSandbox,
      this.inferenceServiceFactory,
    ) as InstanceType<SubUsecase>;
  }

  protected async enqueueBackgroundJob<Name extends BackgroundJobName>(
    name: Name,
    input: Extract<BackgroundJob, { name: Name }>["input"],
  ): Promise<void> {
    const backgroundJob: BackgroundJobEntity = {
      id: Id.generate.backgroundJob(),
      name: name,
      input: input,
      status: BackgroundJobStatus.Enqueued,
      enqueuedAt: new Date(),
      startedProcessingAt: null,
      finishedProcessingAt: null,
      error: null,
    };
    await this.repos.backgroundJob.insert(backgroundJob);
  }
}
