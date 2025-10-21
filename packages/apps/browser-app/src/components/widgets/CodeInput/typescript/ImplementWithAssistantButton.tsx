import type { TypescriptLib } from "@superego/backend";
import type { RefObject } from "react";
import { PiMagicWand } from "react-icons/pi";
import { useIntl } from "react-intl";
import useIsInferenceConfigured from "../../../../business-logic/assistant/useIsInferenceConfigured.js";
import { useImplementTypescriptFunction } from "../../../../business-logic/backend/hooks.js";
import ToastType from "../../../../business-logic/toasts/ToastType.js";
import toastQueue from "../../../../business-logic/toasts/toastQueue.js";
import type monaco from "../../../../monaco.js";
import IconButton from "../../IconButton/IconButton.js";
import Skeleton from "../../Skeleton/Skeleton.js";
import * as cs from "./TypescriptEditor.css.js";

interface Props {
  assistantImplementation?:
    | { instructions: string; template: string }
    | undefined;
  typescriptLibs: TypescriptLib[];
  valueModelRef: RefObject<monaco.editor.ITextModel | null>;
}
export default function ImplementWithAssistantButton({
  assistantImplementation,
  typescriptLibs,
  valueModelRef,
}: Props) {
  const intl = useIntl();
  const { chatCompletions } = useIsInferenceConfigured();
  const { isPending, mutate } = useImplementTypescriptFunction();
  return chatCompletions && assistantImplementation ? (
    <>
      <IconButton
        variant="invisible"
        label={intl.formatMessage({
          defaultMessage: "Implement with assistant",
        })}
        isDisabled={isPending}
        onPress={async () => {
          if (!valueModelRef.current) {
            return;
          }
          const result = await mutate(
            assistantImplementation.instructions,
            assistantImplementation.template,
            typescriptLibs,
            valueModelRef.current.getValue(),
          );
          if (result.success) {
            valueModelRef.current.setValue(result.data);
          } else {
            console.error(result.error);
            toastQueue.add(
              {
                type: ToastType.Error,
                title: intl.formatMessage({
                  defaultMessage: "Implementation failed",
                }),
                description: result.error.name,
              },
              { timeout: 5_000 },
            );
          }
        }}
        className={cs.ImplementWithAssistantButton.button}
      >
        <PiMagicWand />
      </IconButton>
      {isPending ? (
        <div className={cs.ImplementWithAssistantButton.implementingMask}>
          <Skeleton
            variant="list"
            itemCount={
              valueModelRef.current?.getValue().split("\n").length ?? 10
            }
            itemHeight="19px"
            itemGap="2px"
            randomizeItemWidth={true}
          />
        </div>
      ) : null}
    </>
  ) : null;
}
