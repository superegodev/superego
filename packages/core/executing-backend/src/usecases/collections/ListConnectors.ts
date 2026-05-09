import {
  backendContracts,
  type Connector,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import makeConnector from "../../makers/makeConnector.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsListConnectors extends Usecase<
  typeof backendContracts.collections.listConnectors
> {
  async exec(): ResultPromise<Connector[], UnexpectedError> {
    return makeSuccessfulResult(this.connectors.map(makeConnector));
  }
}
