import type { ResultError as ResultErrorGT } from "@superego/global-types";
import * as cs from "./ResultError.css.js";

type Props =
  | { error: ResultErrorGT<any, any>; errors?: undefined }
  | { error?: undefined; errors: ResultErrorGT<any, any>[] };
export default function ResultError({ error, errors }: Props) {
  return (
    <pre className={cs.ResultError.root}>
      <code>{JSON.stringify(error ?? errors, null, 2)}</code>
    </pre>
  );
}
