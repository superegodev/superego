import type { TypescriptFile, TypescriptModule } from "@superego/backend";
import type { RefObject } from "react";
import { PiMagicWand } from "react-icons/pi";
import { useIntl } from "react-intl";
import useIsInferenceConfigured from "../../../../business-logic/assistant/useIsInferenceConfigured.js";
import { useImplementTypescriptModule } from "../../../../business-logic/backend/hooks.js";
import ToastType from "../../../../business-logic/toasts/ToastType.js";
import toastQueue from "../../../../business-logic/toasts/toastQueue.js";
import type monaco from "../../../../monaco.js";
import IconButton from "../../../design-system/IconButton/IconButton.js";
import Skeleton from "../../../design-system/Skeleton/Skeleton.js";
import * as cs from "./TypescriptEditor.css.js";

interface Props {
  filePath: `/${string}.ts` | `/${string}.tsx`;
  assistantImplementation?:
    | {
        description: string;
        rules?: string | undefined;
        template: string;
        userRequest: string;
      }
    | undefined;
  typescriptLibs: TypescriptFile[];
  valueModelRef: RefObject<monaco.editor.ITextModel | null>;
  onImplemented: (implementedModule: TypescriptModule) => void;
}
export default function ImplementWithAssistantButton({
  filePath,
  assistantImplementation,
  typescriptLibs,
  valueModelRef,
  onImplemented,
}: Props) {
  const intl = useIntl();
  const { chatCompletions } = useIsInferenceConfigured();
  const { isPending, mutate } = useImplementTypescriptModule();
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
          const result = await mutate({
            description: assistantImplementation.description,
            rules: assistantImplementation.rules ?? null,
            template: assistantImplementation.template,
            libs: typescriptLibs,
            startingPoint: {
              path: filePath,
              source: valueModelRef.current.getValue(),
            },
            userRequest: assistantImplementation.userRequest,
          });
          if (result.success) {
            onImplemented(result.data);
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
