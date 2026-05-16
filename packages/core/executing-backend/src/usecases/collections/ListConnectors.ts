import type { Backend, Connector, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeConnector from "../../makers/makeConnector.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class CollectionsListConnectors extends BackendUsecase<
  Backend["collections"]["listConnectors"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = structuralSchemas.global.result(
    v.array(structuralSchemas.backend.types.connector()),
    [structuralSchemas.backend.errors.unexpectedError()],
  );

  async exec(): ResultPromise<Connector[], UnexpectedError> {
    return makeSuccessfulResult(this.connectors.map(makeConnector));
  }
}
