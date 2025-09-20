import type { ResultError as ResultErrorGT } from "@superego/global-types";
import type { ReactNode } from "react";
import ResultErrors from "../ResultErrors/ResultErrors.jsx";
import Shell from "../Shell/Shell.jsx";

interface Props {
  headerTitle: ReactNode;
  errors: ResultErrorGT<string, any>[];
}
export default function RouteLevelErrors({ headerTitle, errors }: Props) {
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header title={headerTitle} />
      <Shell.Panel.Content>
        <ResultErrors errors={errors} />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
