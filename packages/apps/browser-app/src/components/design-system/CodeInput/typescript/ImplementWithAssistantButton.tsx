import type { TypescriptLib } from "@superego/backend";
import type { RefObject } from "react";
import { PiSparkle } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useImplementTypescriptFunction } from "../../../../business-logic/backend/hooks.js";
import ToastType from "../../../../business-logic/toasts/ToastType.js";
import toastQueue from "../../../../business-logic/toasts/toastQueue.js";
import type monaco from "../../../../monaco.js";
import IconButton from "../../IconButton/IconButton.js";
import Skeleton from "../../Skeleton/Skeleton.js";
import * as cs from "./TypescriptEditor.css.js";

interface Props {
  assistantImplementationInstructions: string;
  typescriptLibs: TypescriptLib[];
  valueModelRef: RefObject<monaco.editor.ITextModel | null>;
}
export default function ImplementWithAssistantButton({
  assistantImplementationInstructions,
  typescriptLibs,
  valueModelRef,
}: Props) {
  const intl = useIntl();
  const { isPending, mutate } = useImplementTypescriptFunction();
  return (
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
            assistantImplementationInstructions,
            typescriptLibs,
            valueModelRef.current.getValue(),
          );
          if (result.success) {
            valueModelRef.current.setValue(result.data);
          } else {
            console.error(result.error);
            toastQueue.add({
              type: ToastType.Error,
              title: intl.formatMessage({
                defaultMessage: "Implementation failed",
              }),
              description: result.error.name,
            });
          }
        }}
        className={cs.ImplementWithAssistantButton.button}
      >
        <PiSparkle />
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
  );
}
