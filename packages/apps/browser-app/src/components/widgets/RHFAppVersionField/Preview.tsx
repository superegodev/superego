import type { AppStateDefinition } from "@superego/backend";
import {
  type App,
  AppType,
  type Collection,
  type TypescriptModule,
} from "@superego/backend";
import { defaultAppPermissions, Id } from "@superego/shared-utils";
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
  stateDefinition: AppStateDefinition;
  targetCollections: Collection[];
  className: string;
}
export default function Preview({
  mainTsx,
  stateDefinition,
  targetCollections,
  className,
}: Props) {
  const appCompilationFailed =
    mainTsx.compiled === forms.constants.COMPILATION_FAILED;
  const app = useMemo(() => {
    const app = getApp(mainTsx, targetCollections, stateDefinition);
    return app;
  }, [mainTsx, targetCollections, stateDefinition]);
  return (
    <div
      className={classnames(
        cs.Preview.root[appCompilationFailed ? "invalid" : "valid"],
        className,
      )}
    >
      <p>
        <FormattedMessage defaultMessage="Preview state is temporary. Browser dialogs, printing, and downloads are disabled, and no HTTP destinations are added. Run the saved app to test permissions." />
      </p>
      {app ? (
        <AppRenderer
          key={targetCollections.map(({ id }) => id).join(",")}
          app={app}
          preview={true}
        />
      ) : null}
      {appCompilationFailed ? (
        <FormattedMessage defaultMessage="App compilation failed." />
      ) : null}
    </div>
  );
}

function getApp(
  mainTsx: TypescriptModule,
  targetCollections: Collection[],
  stateDefinition: AppStateDefinition,
): App | null {
  return !invalidCompiledValues.has(mainTsx.compiled)
    ? {
        id: Id.generate.app(),
        type: AppType.CollectionView,
        name: "New App Preview",
        latestVersion: {
          permissions: defaultAppPermissions,
          stateDefinition,
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
