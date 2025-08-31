import type { Result, ResultError } from "@superego/backend";
import { type UseQueryResult, useQueries } from "@tanstack/react-query";
import type { ReactNode } from "react";
import isEmpty from "../../utils/isEmpty.js";
import type BackendQuery from "./BackendQuery.js";
import useBackend from "./useBackend.js";

type ExtractBackendQueryData<
  DataLoaderQueries extends readonly BackendQuery<any>[],
> = {
  [Index in keyof DataLoaderQueries]: DataLoaderQueries[Index] extends BackendQuery<
    infer QueryResult
  >
    ? QueryResult extends Result<infer Data, any>
      ? NonNullable<Data>
      : never
    : never;
};

interface Props<Queries extends readonly BackendQuery<any>[]> {
  queries: [...Queries];
  renderErrors?: ((errors: ResultError<any, any>[]) => ReactNode) | undefined;
  children: (...args: ExtractBackendQueryData<Queries>) => ReactNode;
}
export default function DataLoader<
  Queries extends readonly BackendQuery<any>[],
>({ queries, renderErrors, children }: Props<Queries>) {
  const backend = useBackend();
  const results: UseQueryResult<Result<any, any>>[] = useQueries({
    queries: queries.map((query) => query(backend)),
  });

  const anyPending = results.some(({ isPending }) => isPending);
  if (anyPending) {
    return null;
  }

  const errors = results
    .map(({ data }) => data?.error)
    .filter((error) => !!error);
  if (!isEmpty(errors)) {
    return renderErrors ? renderErrors(errors) : null;
  }

  const datas = results.map(({ data }) => data!.data);
  return children(...(datas as any));
}
