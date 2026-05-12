import type { Backend, Connector, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { makeSuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeConnector from "../../makers/makeConnector.js";
import Usecase from "../../utils/Usecase.js";
import { connector } from "../../validation/domain/connector.js";
import { unexpectedError } from "../../validation/errors.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class CollectionsListConnectors extends Usecase<
  Backend["collections"]["listConnectors"]
> {
  argumentsSchema = v.tuple([]);
  resultSchema = makeResultSchema(v.array(connector()), [unexpectedError()]);

  async exec(): ResultPromise<Connector[], UnexpectedError> {
    return makeSuccessfulResult(this.connectors.map(makeConnector));
  }
}
