import type {
  CollectionId,
  InferenceOptions,
  Message,
  MessageContentPart,
  NonEmptyArray,
  TypescriptModule,
} from "@superego/backend";
import { useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import useUndoRedo from "../CodeInput/common-hooks/useUndoRedo.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import UserMessageContentInput from "../UserMessageContentInput/UserMessageContentInput.js";
import EditingToolbar from "./EditingToolbar.js";
import ImplementingSpinner from "./ImplementingSpinner.js";
import Preview from "./Preview.js";
import type Props from "./Props.js";
import ResolveIncompatibilityModal from "./ResolveIncompatibilityModal.js";
import * as cs from "./RHFAppVersionField.css.js";
import useElementHeight from "./useElementHeight.js";
import useSttAndImplement from "./useSttAndImplement.js";
import useTypescriptLibs from "./useTypescriptLibs.js";
import View from "./View.js";

export default function EagerRHFAppVersionField({ control, name, app }: Props) {
  const intl = useIntl();
  const { collections } = useGlobalData();

  const [activeView, setActiveView] = useState(View.Preview);

  const filesFieldName = `${name}.files./main__DOT__tsx`;
  const { field: filesField } = useController({
    control,
    name: filesFieldName,
  });
  const mainTsx: TypescriptModule = filesField.value;

  const targetCollectionIdsFieldName = `${name}.targetCollectionIds`;
  const { field: targetCollectionIdsField } = useController({
    control,
    name: targetCollectionIdsFieldName,
  });
  const targetCollectionIds: CollectionId[] = targetCollectionIdsField.value;
  const targetCollections = useMemo(
    () => CollectionUtils.findAllCollections(collections, targetCollectionIds),
    [collections, targetCollectionIds],
  );

  const typescriptLibs = useTypescriptLibs(targetCollections);

  const { isPending, mutate } = useSttAndImplement(
    targetCollections,
    mainTsx,
    typescriptLibs,
  );

  const onSend = async (
    messageContent: Message.User["content"],
    inferenceOptions: InferenceOptions<"completion">,
  ) => {
    const { success, data, error } = await mutate(
      // There aren't File parts since allowFileParts is set to false.
      messageContent as NonEmptyArray<
        MessageContentPart.Text | MessageContentPart.Audio
      >,
      inferenceOptions,
    );
    if (success) {
      filesField.onChange(data);
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

  const {
    height: userMessageContentInputHeight,
    ref: userMessageContentInputRef,
  } = useElementHeight<HTMLDivElement>();

  const undoRedo = useUndoRedo();

  return (
    <div className={cs.EagerRHFAppVersionField.root}>
      <EditingToolbar
        onUndo={undoRedo.undo}
        isUndoDisabled={!undoRedo.canUndo}
        onRedo={undoRedo.redo}
        isRedoDisabled={!undoRedo.canRedo}
        onActivateView={setActiveView}
        activeView={activeView}
        collections={collections}
        selectedCollectionIds={targetCollectionIds}
        onSelectedCollectionIdsChange={targetCollectionIdsField.onChange}
        className={cs.EagerRHFAppVersionField.editingToolbar}
      />
      <div className={cs.EagerRHFAppVersionField.content}>
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
            cs.EagerRHFAppVersionField.preview[
              activeView === View.Preview ? "visible" : "hidden"
            ]
          }
        />
        <RHFTypescriptModuleField
          control={control}
          name={filesFieldName}
          language="typescript-jsx"
          undoRedo={undoRedo.prop}
          typescriptLibs={typescriptLibs}
          // There doesn't seem to be a better way to do this, as the monaco
          // editor manages its own width and makes controlling its height
          // externally difficult. Hence the manual pixel value.
          maxHeight={`calc(100svh - ${156 + userMessageContentInputHeight}px)`}
          className={
            cs.EagerRHFAppVersionField.typescriptModule[
              activeView === View.Code ? "visible" : "hidden"
            ]
          }
          codeInputClassName={
            cs.EagerRHFAppVersionField.typescriptModuleCodeInput
          }
        />
      </div>
      <UserMessageContentInput
        ref={userMessageContentInputRef}
        conversation={null}
        onSend={onSend}
        isSending={isPending}
        placeholder={intl.formatMessage({
          defaultMessage: "What do you want to build?",
        })}
        autoFocus={true}
        allowFileParts={false}
        className={cs.EagerRHFAppVersionField.userMessageContentInput}
      />
    </div>
  );
}
