import type DataRepositories from "../requirements/DataRepositories.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";

export default abstract class Usecase<Exec extends (...args: any[]) => any> {
  constructor(
    protected repos: DataRepositories,
    protected javascriptSandbox: JavascriptSandbox,
  ) {}

  abstract exec(...args: Parameters<Exec>): ReturnType<Exec>;
}
