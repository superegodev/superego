import type { ResultPromise } from "@superego/global-types";
import { makeUnsuccessfulResult } from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../makers/makeResultError.js";
import makeValidationIssues from "../makers/makeValidationIssues.js";

export default function validateArgs<const Schemas extends v.GenericSchema[]>(
  schemas: [...Schemas],
) {
  return <This>(
    target: (
      this: This,
      ...args: { [K in keyof Schemas]: v.InferOutput<Schemas[K]> }
    ) => ResultPromise<any, any>,
    _context: ClassMethodDecoratorContext,
  ): typeof target => function (
      this: This,
      ...args: { [K in keyof Schemas]: v.InferOutput<Schemas[K]> }
    ): ResultPromise<any, any> {
      for (let i = 0; i < schemas.length; i++) {
        if (i >= args.length) break;
        const result = v.safeParse(schemas[i]!, args[i]);
        if (!result.success) {
          return Promise.resolve(
            makeUnsuccessfulResult(
              makeResultError("InputNotValid", {
                issues: makeValidationIssues(result.issues),
              }),
            ),
          );
        }
      }
      return target.call(this, ...args);
    } as typeof target;
}
