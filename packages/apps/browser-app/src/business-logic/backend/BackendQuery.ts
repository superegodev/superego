import type { Backend } from "@superego/backend";
import type { Result } from "@superego/global-types";
import type { UseQueryOptions } from "@tanstack/react-query";
import type Milliseconds from "../../utils/Milliseconds.js";
import type { ArgsOf, ResultOf } from "./typeUtils.js";

type BackendQuery<QueryResult extends Result<any, any>> = (
  backend: Backend,
) => UseQueryOptions<QueryResult, never>;
export default BackendQuery;

export interface BackendQueryOptions<QueryResult extends Result<any, any>> {
  pollingInterval?: Milliseconds;
  pollWhile?: (result: QueryResult | undefined) => boolean;
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
      queryFn: () => (backend[entity][method] as any)(...args),
      throwOnError: true,
      refetchInterval: options.pollingInterval
        ? ({ state }) =>
            !options.pollWhile || options.pollWhile(state.data)
              ? options.pollingInterval
              : false
        : false,
    });
  };
}
