import type { Backend } from "@superego/backend";
import type { Milliseconds, Result, ResultError } from "@superego/global-types";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ArgsOf, ResultOf } from "./typeUtils.js";

type BackendQuery<QueryResult extends Result<any, any>> = (
  backend: Backend,
) => UseQueryOptions<QueryResult, never>;
export default BackendQuery;

export interface BackendQueryOptions<QueryResult extends Result<any, any>> {
  pollingInterval?: Milliseconds;
  pollWhile?: (result: QueryResult | undefined) => boolean;
}

export class ResultErrorWrapper extends Error {
  constructor(
    public result: Result<any, ResultError<any, any>> & { success: false },
  ) {
    super();
  }
}

export function makeBackendQueryGetter<
  Entity extends keyof Backend,
  Method extends keyof Backend[Entity],
>(
  entity: Entity,
  method: Method,
  queryKey: (...args: ArgsOf<Entity, Method>) => string[],
): (
  args: ArgsOf<Entity, Method>,
  options?: BackendQueryOptions<ResultOf<Entity, Method>>,
) => BackendQuery<ResultOf<Entity, Method>> {
  return function getBackendQuery(args, options = {}) {
    return (backend) => ({
      queryKey: queryKey(...args),
      queryFn: async () => {
        const result: ResultOf<Entity, Method> = await (
          backend[entity][method] as any
        )(...args);
        if (!result.success) {
          throw new ResultErrorWrapper(result);
        }
        return result;
      },
      refetchInterval: options.pollingInterval
        ? ({ state }) =>
            !options.pollWhile || options.pollWhile(state.data)
              ? options.pollingInterval
              : false
        : false,
    });
  };
}
