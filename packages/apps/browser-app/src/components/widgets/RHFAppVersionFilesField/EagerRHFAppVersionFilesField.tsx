import type { Message, TypescriptModule } from "@superego/backend";
import { useState } from "react";
import { useController } from "react-hook-form";
import { useIntl } from "react-intl";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import useUndoRedo from "../CodeInput/common-hooks/useUndoRedo.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import UserMessageContentInput from "../UserMessageContentInput/UserMessageContentInput.js";
import EditingToolbar from "./EditingToolbar.js";
import ImplementingSpinner from "./ImplementingSpinner.js";
import Preview from "./Preview.js";
import type Props from "./Props.js";
import ResolveIncompatibilityModal from "./ResolveIncompatibilityModal.js";
import * as cs from "./RHFAppVersionFilesField.css.js";
import useSttAndImplement from "./useSttAndImplement.js";
import useTypescriptLibs from "./useTypescriptLibs.js";
import View from "./View.js";

export default function EagerRHFAppVersionFilesField({
  control,
  name,
  app,
  targetCollections,
}: Props) {
  const intl = useIntl();
  const [activeView, setActiveView] = useState(View.Preview);

  const fieldName = `${name}./main__DOT__tsx`;
  const { field } = useController({ control, name: fieldName });
  const mainTsx: TypescriptModule = field.value;

  const typescriptLibs = useTypescriptLibs(targetCollections);

  const { isPending, mutate } = useSttAndImplement(
    targetCollections,
    mainTsx,
    typescriptLibs,
  );

  const onSend = async (messageContent: Message.User["content"]) => {
    const { success, data, error } = await mutate(messageContent);
    if (success) {
      field.onChange(data);
    } else {
      console.error(error);
      toasts.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "An error occurred generating the app",
        }),
        error: error,
      });
    }
  };

  const undoRedo = useUndoRedo();

  return (
    <div className={cs.EagerRHFAppVersionFilesField.root}>
      <EditingToolbar
        onUndo={undoRedo.undo}
        isUndoDisabled={!undoRedo.canUndo}
        onRedo={undoRedo.redo}
        isRedoDisabled={!undoRedo.canRedo}
        onActivateView={setActiveView}
        activeView={activeView}
        className={cs.EagerRHFAppVersionFilesField.editingToolbar}
      />
      <div className={cs.EagerRHFAppVersionFilesField.content}>
        {app ? (
          <ResolveIncompatibilityModal
            app={app}
            targetCollections={targetCollections}
            onResolveWithAssistant={onSend}
          />
        ) : null}
        {isPending ? <ImplementingSpinner /> : null}
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
          undoRedo={undoRedo.prop}
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
        onSend={onSend}
        isSending={isPending}
        placeholder={intl.formatMessage({
          defaultMessage: "What do you want to build?",
        })}
        autoFocus={true}
        className={cs.EagerRHFAppVersionFilesField.userMessageContentInput}
      />
    </div>
  );
}
