import type { Collection } from "@superego/backend";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.jsx";
import UserMessageContentInput from "../UserMessageContentInput/UserMessageContentInput.js";
import EditingToolbar from "./EditingToolbar.js";
import Preview from "./Preview.js";
import * as cs from "./RHFAppVersionFilesField.css.js";
import View from "./View.js";

interface Props {
  control: Control<any>;
  name: string;
  targetCollections: Collection[];
}
export default function RHFAppVersionFilesField({ control, name }: Props) {
  const intl = useIntl();
  const [activeView, setActiveView] = useState(View.Preview);
  return (
    <div className={cs.RHFAppVersionFilesField.root}>
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
        className={cs.RHFAppVersionFilesField.editingToolbar}
      />
      <div className={cs.RHFAppVersionFilesField.content}>
        {activeView === View.Preview ? <Preview /> : null}
        <RHFTypescriptModuleField
          control={control}
          name={`${name}./main__DOT__tsx`}
          // There doesn't seem to be a better way to do this, as the monaco
          // editor manages its own width and makes controlling its height
          // externally difficult. Hence the manual pixel value.
          maxHeight="calc(100svh - 230px)"
          className={
            cs.RHFAppVersionFilesField.typescriptModule[
              activeView === View.Code ? "visible" : "hidden"
            ]
          }
          codeInputClassName={
            cs.RHFAppVersionFilesField.typescriptModuleCodeInput
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
        className={cs.RHFAppVersionFilesField.userMessageContentInput}
      />
    </div>
  );
}
