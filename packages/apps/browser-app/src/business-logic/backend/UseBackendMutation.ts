import type { Backend, RpcResult } from "@superego/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import type { ArgsOf, BackendMethod, RpcResultOf } from "./typeUtils.js";
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
      result: RpcResultOf<Entity, Method>;
      mutate: BackendMethod<Entity, Method>;
    };
export default UseBackendMutation;

export function makeUseBackendMutation<
  Entity extends keyof Backend,
  Method extends keyof Backend[Entity],
>(
  entity: Entity,
  method: Method,
  invalidateQueryKeys: (
    args: ArgsOf<Entity, Method>,
    result: NonNullable<RpcResultOf<Entity, Method>["data"]>,
  ) => string[][],
): () => UseBackendMutation<Entity, Method> {
  return function useBackendMutation() {
    const backend = useBackend();
    const queryClient = useQueryClient();
    const isMutatingRef = useRef(false);
    const { isIdle, isPending, data, mutateAsync } = useMutation({
      mutationFn: (args: any[]) => (backend[entity][method] as any)(...args),
      throwOnError: true,
      onSuccess(result: RpcResult<any, any>, args: ArgsOf<Entity, Method>) {
        if (result.success) {
          const queryKeys = invalidateQueryKeys(args, result.data);
          for (const queryKey of queryKeys) {
            queryClient.invalidateQueries({ queryKey });
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
          ): Promise<RpcResultOf<Entity, Method>> {
            // Throw if a mutation is already underway. This prevents the mutation
            // being executed twice if, for example, the user clicks twice in rapid
            // succession on a button. (In general, the button should be disabled
            // when the mutation is executing, but the developer might have
            // forgotten to do so, or React might have been too slow to update the
            // button state, disabling it.)
            if (isMutatingRef.current) {
              throw new Error("Mutation already executing");
            }
            isMutatingRef.current = true;
            const result = await mutateAsync(args);
            isMutatingRef.current = false;
            return result as RpcResultOf<Entity, Method>;
          }
        : () => {},
    } as UseBackendMutation<Entity, Method>;
  };
}
