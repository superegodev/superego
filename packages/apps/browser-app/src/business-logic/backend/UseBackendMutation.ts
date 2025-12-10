import type { Backend } from "@superego/backend";
import type { Result } from "@superego/global-types";
import {
  type MutationFunctionContext,
  type QueryClient,
  useMutation,
} from "@tanstack/react-query";
import { useRef } from "react";
import type { ArgsOf, BackendMethod, ResultOf } from "./typeUtils.js";
import useBackend from "./useBackend.js";

type UseBackendMutation<
  Entity extends keyof Backend,
  Method extends keyof Backend[Entity],
> =
  | {
      isIdle: true;
      isPending: false;
      result: null;
      mutate: BackendMethod<Entity, Method>;
    }
  | {
      isIdle: false;
      isPending: true;
      result: null;
      mutate: BackendMethod<Entity, Method>;
    }
  | {
      isIdle: false;
      isPending: false;
      result: ResultOf<Entity, Method>;
      mutate: BackendMethod<Entity, Method>;
    };
export default UseBackendMutation;

export function makeUseBackendMutation<
  Entity extends keyof Backend,
  Method extends keyof Backend[Entity],
>(
  entity: Entity,
  method: Method,
  invalidateQueryKeys?: (
    args: ArgsOf<Entity, Method>,
    result: NonNullable<ResultOf<Entity, Method>["data"]>,
  ) => string[][],
  updateCache?: (
    queryClient: QueryClient,
    args: ArgsOf<Entity, Method>,
    result: NonNullable<ResultOf<Entity, Method>["data"]>,
  ) => void,
): () => UseBackendMutation<Entity, Method> {
  return function useBackendMutation() {
    const backend = useBackend();
    const isMutatingRef = useRef(false);
    const { isIdle, isPending, data, mutateAsync } = useMutation({
      mutationFn: (args: ArgsOf<Entity, Method>) =>
        (backend[entity][method] as any)(...args),
      throwOnError: true,
      onSuccess(
        result: Result<any, any>,
        args: ArgsOf<Entity, Method>,
        _,
        context: MutationFunctionContext,
      ) {
        if (result.success) {
          if (invalidateQueryKeys) {
            const queryKeys = invalidateQueryKeys(args, result.data);
            for (const queryKey of queryKeys) {
              context.client.invalidateQueries({ queryKey });
            }
          }
          if (updateCache) {
            updateCache(context.client, args, result.data);
          }
        }
      },
    });
    return {
      isIdle,
      isPending,
      result: !isPending && data ? data : null,
      mutate: !isPending
        ? async function mutate(
            ...args: ArgsOf<Entity, Method>
          ): Promise<ResultOf<Entity, Method>> {
            // Throw if a mutation is already underway. This prevents the
            // mutation being executed twice if, for example, the user clicks
            // twice in rapid succession on a button. (In general, the button
            // should be disabled when the mutation is executing, but the
            // developer might have forgotten to do so, or React might have been
            // too slow to update the button state, disabling it.)
            if (isMutatingRef.current) {
              throw new Error("Mutation already executing");
            }
            isMutatingRef.current = true;
            const result = await mutateAsync(args);
            isMutatingRef.current = false;
            return result as ResultOf<Entity, Method>;
          }
        : () => {},
    } as UseBackendMutation<Entity, Method>;
  };
}
