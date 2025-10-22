import sandboxTypescriptLibs from "@superego/app-sandbox/typescript-libs";
import type { TypescriptFile, TypescriptModule } from "@superego/backend";
import { codegen } from "@superego/schema";
import { useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.jsx";
import UserMessageContentInput from "../UserMessageContentInput/UserMessageContentInput.jsx";
import EditingToolbar from "./EditingToolbar.jsx";
import Preview from "./Preview.jsx";
import type Props from "./Props.js";
import * as cs from "./RHFAppVersionFilesField.css.js";
import View from "./View.js";

export default function EagerRHFAppVersionFilesField({
  control,
  name,
  targetCollections,
}: Props) {
  const intl = useIntl();
  const [activeView, setActiveView] = useState(View.Preview);

  const fieldName = `${name}./main__DOT__tsx`;
  const mainTsx: TypescriptModule = useWatch({ control, name: fieldName });

  const typescriptLibs = useMemo(
    () => [
      ...sandboxTypescriptLibs,
      ...targetCollections.map(
        (targetCollection) =>
          ({
            path: `/${targetCollection.id}.ts`,
            source: codegen(targetCollection.latestVersion.schema),
          }) satisfies TypescriptFile,
      ),
    ],
    [targetCollections],
  );

  return (
    <div className={cs.EagerRHFAppVersionFilesField.root}>
      <EditingToolbar
        onUndo={(): void => {
          throw new Error("Function not implemented.");
        }}
        isUndoDisabled={true}
        onRedo={(): void => {
          throw new Error("Function not implemented.");
        }}
        isRedoDisabled={true}
        onActivateView={setActiveView}
        activeView={activeView}
        className={cs.EagerRHFAppVersionFilesField.editingToolbar}
      />
      <div className={cs.EagerRHFAppVersionFilesField.content}>
        <Preview
          mainTsx={mainTsx}
          targetCollections={targetCollections}
          className={
            cs.EagerRHFAppVersionFilesField.preview[
              activeView === View.Preview ? "visible" : "hidden"
            ]
          }
        />
        <RHFTypescriptModuleField
          control={control}
          name={fieldName}
          language="typescript-jsx"
          typescriptLibs={typescriptLibs}
          // There doesn't seem to be a better way to do this, as the monaco
          // editor manages its own width and makes controlling its height
          // externally difficult. Hence the manual pixel value.
          maxHeight="calc(100svh - 230px)"
          className={
            cs.EagerRHFAppVersionFilesField.typescriptModule[
              activeView === View.Code ? "visible" : "hidden"
            ]
          }
          codeInputClassName={
            cs.EagerRHFAppVersionFilesField.typescriptModuleCodeInput
          }
        />
      </div>
      <UserMessageContentInput
        conversation={null}
        onSend={(messageContent) => {
          // TODO
          console.log(messageContent);
        }}
        isSending={false}
        placeholder={intl.formatMessage({
          defaultMessage: "What do you want to build?",
        })}
        autoFocus={false}
        className={cs.EagerRHFAppVersionFilesField.userMessageContentInput}
      />
    </div>
  );
}
