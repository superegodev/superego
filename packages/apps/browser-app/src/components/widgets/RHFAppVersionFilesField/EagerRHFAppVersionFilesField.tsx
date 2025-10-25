import sandboxTypescriptLibs from "@superego/app-sandbox/typescript-libs";
import {
  type Message,
  MessageContentPartType,
  type TypescriptFile,
  type TypescriptModule,
} from "@superego/backend";
import { codegen } from "@superego/schema";
import { useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { useIntl } from "react-intl";
import {
  useImplementTypescriptModule,
  useStt,
} from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toastQueue from "../../../business-logic/toasts/toastQueue.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import UserMessageContentInput from "../UserMessageContentInput/UserMessageContentInput.js";
import EditingToolbar from "./EditingToolbar.js";
import ImplementingSpinner from "./ImplementingSpinner.js";
import Preview from "./Preview.js";
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
  const { field } = useController({ control, name: fieldName });
  const mainTsx: TypescriptModule = field.value;

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

  const { isPending: isSttPending, mutate: stt } = useStt();
  const {
    isPending: isImplementTypescriptModulePending,
    mutate: implementTypescriptModule,
  } = useImplementTypescriptModule();
  const isImplementing = isSttPending || isImplementTypescriptModulePending;

  // TODO: clean up
  const onSend = async (messageContent: Message.User["content"]) => {
    const [part] = messageContent;

    let userRequest: string;

    if (part.type === MessageContentPartType.Audio) {
      const sttResult = await stt(part.audio);
      if (!sttResult.success) {
        console.error(sttResult.error);
        toastQueue.add({
          type: ToastType.Error,
          title: intl.formatMessage({
            defaultMessage: "An error occurred transcribing your message",
          }),
          description: sttResult.error.name,
        });
        return;
      }
      userRequest = sttResult.data;
    } else {
      userRequest = part.text;
    }

    const targetCollectionsSnippet = targetCollections
      .flatMap((collection) => {
        if (!collection.settings.description) {
          return `- ${collection.settings.name}`;
        }
        const [firstDescriptionLine, ...otherDescriptionLines] =
          collection.settings.description.split("\n");

        return [
          `- ${collection.settings.name}: ${firstDescriptionLine}`,
          otherDescriptionLines.map((line) => `  ${line}`),
        ];
      })
      .join("\n");

    const implementTypescriptModuleResult = await implementTypescriptModule({
      description: `
This module implements and default-exports a single-file React app for
visualizing the documents in the following collections:

${targetCollectionsSnippet}

      `.trim(),
      rules: null,
      additionalInstructions: `
The "USER REQUEST HISTORY" comment at the top of the file records all previous
user requests that shaped the current implementation. Review it to understand
the context and intent behind the existing code before addressing the new
request.

After completing the implementation:
  - Add a bullet point with a concise summary of the current user request to the
    history comment.
  - If this change supersedes one or more older requests, remove them.
      `.trim(),
      template:
        forms.defaults.collectionViewAppFiles(targetCollections)[
          "/main__DOT__tsx"
        ].source,
      libs: typescriptLibs,
      startingPoint: {
        path: "/main.tsx",
        source: mainTsx.source,
      },
      userRequest: userRequest,
    });
    if (implementTypescriptModuleResult.success) {
      field.onChange(implementTypescriptModuleResult.data);
    } else {
      console.error(implementTypescriptModuleResult.error);
      toastQueue.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "An error occurred generating the app",
        }),
        description: implementTypescriptModuleResult.error.name,
      });
      return;
    }
  };

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
        {isImplementing ? <ImplementingSpinner /> : null}
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
        onSend={onSend}
        isSending={isImplementing}
        placeholder={intl.formatMessage({
          defaultMessage: "What do you want to build?",
        })}
        autoFocus={true}
        className={cs.EagerRHFAppVersionFilesField.userMessageContentInput}
      />
    </div>
  );
}
