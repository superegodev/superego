import {
  type App,
  AppType,
  type Collection,
  type TypescriptModule,
} from "@superego/backend";
import { MonacoTypescriptCompiler } from "@superego/monaco-typescript-compiler";
import { Id } from "@superego/shared-utils";
import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import monaco from "../../../monaco.js";
import classnames from "../../../utils/classnames.js";
import AppRenderer from "../AppRenderer/AppRenderer.js";
import * as cs from "./RHFAppVersionField.css.js";
import useTypescriptLibs from "./useTypescriptLibs.js";

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
  const typescriptLibs = useTypescriptLibs(targetCollections);
  const [mainJs, setMainJs] = useState<string | null>(null);
  const [appCompilationFailed, setAppCompilationFailed] = useState(false);
  const compiler = useMemo(
    () => new MonacoTypescriptCompiler(async () => monaco),
    [],
  );
  useEffect(() => {
    let shouldIgnore = false;
    compiler
      .compile({ path: "/main.tsx", source: mainTsx }, typescriptLibs)
      .then((result) => {
        if (shouldIgnore) {
          return;
        }
        if (result.success) {
          setMainJs(result.data);
          setAppCompilationFailed(false);
        } else {
          setMainJs(null);
          setAppCompilationFailed(true);
        }
      });
    return () => {
      shouldIgnore = true;
    };
  }, [compiler, mainTsx, typescriptLibs]);

  const app = mainJs ? getApp(mainTsx, mainJs, targetCollections) : null;
  return (
    <div
      className={classnames(
        cs.Preview.root[appCompilationFailed ? "invalid" : "valid"],
        className,
      )}
    >
      {app ? (
        <AppRenderer
          key={targetCollections.map(({ id }) => id).join(",")}
          app={app}
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
  mainJs: string,
  targetCollections: Collection[],
): App | null {
  return {
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
        "/main.js": mainJs,
      },
      createdAt: new Date(),
    },
    createdAt: new Date(),
  };
}
