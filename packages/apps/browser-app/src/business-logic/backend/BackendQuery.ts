import type { Backend } from "@superego/backend";
import type { Result } from "@superego/global-types";
import type { FetchQueryOptions } from "@tanstack/react-query";
import type { ArgsOf, ResultOf } from "./typeUtils.js";

type BackendQuery<QueryResult extends Result<any, any>> = (
  backend: Backend,
) => FetchQueryOptions<QueryResult, never>;
export default BackendQuery;

export function makeBackendQueryGetter<
  Entity extends keyof Backend,
  Method extends keyof Backend[Entity],
>(
  entity: Entity,
  method: Method,
  queryKey: (...args: ArgsOf<Entity, Method>) => string[],
): (...args: ArgsOf<Entity, Method>) => BackendQuery<ResultOf<Entity, Method>> {
  return function getBackendQuery(...args) {
    return (backend) => ({
      queryKey: queryKey(...args),
      queryFn: () => (backend[entity][method] as any)(...args),
      throwOnError: true,
    });
  };
}
