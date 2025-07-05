import type * as backend from "@superego/backend";
import * as cs from "./RpcError.css.js";

type Props =
  | { error: backend.RpcError<any, any>; errors?: undefined }
  | { error?: undefined; errors: backend.RpcError<any, any>[] };
export default function RpcError({ error, errors }: Props) {
  return (
    <pre className={cs.RpcError.root}>
      <code>{JSON.stringify(error ?? errors, null, 2)}</code>
    </pre>
  );
}
