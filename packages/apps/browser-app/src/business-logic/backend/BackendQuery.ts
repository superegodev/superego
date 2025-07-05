import type { Backend, RpcResult } from "@superego/backend";
import type { FetchQueryOptions } from "@tanstack/react-query";
import type { ArgsOf, RpcResultOf } from "./typeUtils.js";

type BackendQuery<QueryResult extends RpcResult<any, any>> = (
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
): (
  ...args: ArgsOf<Entity, Method>
) => BackendQuery<RpcResultOf<Entity, Method>> {
  return function getBackendQuery(...args) {
    return (backend) => ({
      queryKey: queryKey(...args),
      queryFn: () => (backend[entity][method] as any)(...args),
      throwOnError: true,
    });
  };
}
