import {
  type App,
  AppType,
  type Collection,
  type TypescriptModule,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { FormattedMessage } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import classnames from "../../../utils/classnames.js";
import AppRenderer from "../AppRenderer/AppRenderer.js";
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
  const app = getApp(mainTsx, targetCollections);
  return (
    <div
      className={classnames(
        cs.Preview.root[appCompilationFailed ? "invalid" : "valid"],
        className,
      )}
    >
      {app ? <AppRenderer app={app} /> : null}
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
