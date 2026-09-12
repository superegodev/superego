import type { TypescriptFile, TypescriptModule } from "@superego/backend";
import { inferenceOptionsHas } from "@superego/shared-utils";
import { type RefObject, useState } from "react";
import { PiMagicWand } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useImplementTypescriptModule } from "../../../../business-logic/backend/hooks.js";
import useDefaultInferenceOptions from "../../../../business-logic/inference/useDefaultInferenceOptions.js";
import toasts from "../../../../business-logic/toasts/toasts.js";
import ToastType from "../../../../business-logic/toasts/ToastType.js";
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
        additionalInstructions?: string | undefined;
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
  const defaultInferenceOptions = useDefaultInferenceOptions();
  const [implementationLineCount, setImplementationLineCount] = useState(10);
  const { isPending, mutate } = useImplementTypescriptModule();
  return inferenceOptionsHas(defaultInferenceOptions, "completion") &&
    assistantImplementation ? (
    <>
      <IconButton
        variant="primary"
        label={intl.formatMessage({
          defaultMessage: "Implement with assistant",
        })}
        isDisabled={isPending}
        onPress={async () => {
          if (!valueModelRef.current) {
            return;
          }
          const source = valueModelRef.current.getValue();
          setImplementationLineCount(source.split("\n").length);
          const result = await mutate(
            {
              description: assistantImplementation.description,
              rules: assistantImplementation.rules ?? null,
              additionalInstructions:
                assistantImplementation.additionalInstructions ?? null,
              template: assistantImplementation.template,
              libs: typescriptLibs,
              startingPoint: {
                path: filePath,
                source: source,
              },
              userRequest: assistantImplementation.userRequest,
            },
            defaultInferenceOptions,
          );
          if (result.success) {
            onImplemented(result.data);
          } else {
            console.error(result.error);
            toasts.add({
              type: ToastType.Error,
              title: intl.formatMessage({
                defaultMessage: "Implementation failed",
              }),
              error: result.error,
            });
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
            itemCount={implementationLineCount}
            itemHeight="19px"
            itemGap="2px"
            randomizeItemWidth={true}
          />
        </div>
      ) : null}
    </>
  ) : null;
}
