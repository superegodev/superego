import type DataRepositories from "../requirements/DataRepositories.js";
import type InferenceServiceFactory from "../requirements/InferenceServiceFactory.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";

export default abstract class Usecase<Exec extends (...args: any[]) => any> {
  constructor(
    protected repos: DataRepositories,
    protected javascriptSandbox: JavascriptSandbox,
    protected inferenceServiceFactory: InferenceServiceFactory,
  ) {}

  abstract exec(...args: Parameters<Exec>): ReturnType<Exec>;

  protected sub<SubUsecase extends new (...args: any[]) => Usecase<any>>(
    UsecaseClass: SubUsecase,
  ): InstanceType<SubUsecase> {
    return new UsecaseClass(
      this.repos,
      this.javascriptSandbox,
      this.inferenceServiceFactory,
    ) as InstanceType<SubUsecase>;
  }
}
