import type { Backend, Connector, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeConnector from "../../makers/makeConnector.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsListConnectors extends Usecase<
  Backend["collections"]["listConnectors"]
> {
  async exec(): ResultPromise<Connector[], UnexpectedError> {
    return makeSuccessfulResult(this.connectors.map(makeConnector));
  }
}
