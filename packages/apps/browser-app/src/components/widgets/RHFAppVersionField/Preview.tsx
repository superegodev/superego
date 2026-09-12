import {
  type App,
  type Collection,
  type TypescriptModule,
} from "@superego/backend";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import classnames from "../../../utils/classnames.js";
import AppRenderer from "../AppRenderer/AppRenderer.js";
import * as cs from "./RHFAppVersionField.css.js";

const invalidCompiledValues = new Set([
  forms.constants.COMPILATION_FAILED,
  forms.constants.COMPILATION_IN_PROGRESS,
  forms.constants.COMPILATION_REQUIRED,
]);

interface Props {
  mainTsx: TypescriptModule;
  app: App;
  targetCollections: Collection[];
  className: string;
}
export default function Preview({
  mainTsx,
  app,
  targetCollections,
  className,
}: Props) {
  const appCompilationFailed =
    mainTsx.compiled === forms.constants.COMPILATION_FAILED;
  const previewApp = useMemo(
    () => getPreviewApp(app, mainTsx, targetCollections),
    [app, mainTsx, targetCollections],
  );
  return (
    <div
      className={classnames(
        cs.Preview.root[appCompilationFailed ? "invalid" : "valid"],
        className,
      )}
    >
      {previewApp ? (
        <AppRenderer
          key={`${targetCollections.map(({ id }) => id).join(",")}:${mainTsx.compiled}`}
          app={previewApp}
        />
      ) : null}
      {appCompilationFailed ? (
        <FormattedMessage defaultMessage="App compilation failed." />
      ) : null}
    </div>
  );
}

function getPreviewApp(
  app: App,
  mainTsx: TypescriptModule,
  targetCollections: Collection[],
): App | null {
  return !invalidCompiledValues.has(mainTsx.compiled)
    ? {
        ...app,
        latestVersion: {
          ...app.latestVersion,
          targetCollections: targetCollections.map((collection) => ({
            id: collection.id,
            versionId: collection.latestVersion.id,
          })),
          files: { "/main.tsx": mainTsx },
        },
      }
    : null;
}
