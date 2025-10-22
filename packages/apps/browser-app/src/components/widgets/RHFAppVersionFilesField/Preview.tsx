import {
  type App,
  AppType,
  type Collection,
  type TypescriptModule,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import classnames from "../../../utils/classnames.js";
import AppRenderer from "../AppRenderer/AppRenderer.jsx";
import * as cs from "./RHFAppVersionFilesField.css.js";

const invalidCompiledValues = new Set([
  forms.constants.COMPILATION_FAILED,
  forms.constants.COMPILATION_IN_PROGRESS,
  forms.constants.COMPILATION_REQUIRED,
]);

interface Props {
  mainTsx: TypescriptModule;
  targetCollections: Collection[];
  className: string;
}
export default function Preview({
  mainTsx,
  targetCollections,
  className,
}: Props) {
  const appCompilationFailed =
    mainTsx.compiled === forms.constants.COMPILATION_FAILED;

  // Cache the app so we can show the old version while it's compiling.
  const [app, setApp] = useState<App | null>(() =>
    getApp(mainTsx, targetCollections),
  );
  // The app only effectively changes when mainTsx.compiled changes, and not
  // when the object or source change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    const newApp = getApp(mainTsx, targetCollections);
    if (newApp) {
      setApp(newApp);
    }
  }, [mainTsx.compiled, targetCollections]);

  return (
    <div
      className={classnames(
        cs.Preview.root[appCompilationFailed ? "invalid" : "valid"],
        className,
      )}
    >
      {app && !appCompilationFailed ? <AppRenderer app={app} /> : null}
      {appCompilationFailed ? (
        <FormattedMessage defaultMessage="App compilation failed." />
      ) : null}
    </div>
  );
}

function getApp(
  mainTsx: TypescriptModule,
  targetCollections: Collection[],
): App | null {
  return !invalidCompiledValues.has(mainTsx.compiled)
    ? {
        id: Id.generate.app(),
        type: AppType.CollectionView,
        name: "New App Preview",
        latestVersion: {
          id: Id.generate.appVersion(),
          targetCollections: targetCollections.map((collection) => ({
            id: collection.id,
            versionId: collection.latestVersion.id,
          })),
          files: {
            "/main.tsx": mainTsx,
          },
          createdAt: new Date(),
        },
        createdAt: new Date(),
      }
    : null;
}
