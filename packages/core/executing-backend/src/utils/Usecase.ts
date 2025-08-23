import type DataRepositories from "../requirements/DataRepositories.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import type LlmAssistant from "../requirements/LlmAssistant.js";
import type SpeechService from "../requirements/SpeechService.js";

export default abstract class Usecase<Exec extends (...args: any[]) => any> {
  constructor(
    protected repos: DataRepositories,
    protected javascriptSandbox: JavascriptSandbox,
    protected llmAssistant: LlmAssistant,
    protected speechService: SpeechService,
  ) {}

  abstract exec(...args: Parameters<Exec>): ReturnType<Exec>;

  protected sub<SubUsecase extends new (...args: any[]) => Usecase<any>>(
    UsecaseClass: SubUsecase,
  ): InstanceType<SubUsecase> {
    return new UsecaseClass(
      this.repos,
      this.javascriptSandbox,
      this.llmAssistant,
      this.speechService,
    ) as InstanceType<SubUsecase>;
  }
}
