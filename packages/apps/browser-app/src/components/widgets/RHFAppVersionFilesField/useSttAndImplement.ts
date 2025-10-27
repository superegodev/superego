import {
  type Collection,
  type Message,
  MessageContentPartType,
  type TooManyFailedImplementationAttempts,
  type TypescriptFile,
  type TypescriptModule,
  type UnexpectedError,
  type WriteTypescriptModuleToolNotCalled,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  useImplementTypescriptModule,
  useStt,
} from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";

interface UseSttAndImplement {
  isPending: boolean;
  mutate: (
    messageContent: Message.User["content"],
  ) => ResultPromise<
    TypescriptModule,
    | WriteTypescriptModuleToolNotCalled
    | TooManyFailedImplementationAttempts
    | UnexpectedError
  >;
}
export default function useSttAndImplement(
  targetCollections: Collection[],
  mainTsx: TypescriptModule,
  typescriptLibs: TypescriptFile[],
): UseSttAndImplement {
  const { isPending: isSttPending, mutate: stt } = useStt();
  const {
    isPending: isImplementTypescriptModulePending,
    mutate: implementTypescriptModule,
  } = useImplementTypescriptModule();

  const isPending = isSttPending || isImplementTypescriptModulePending;

  const mutate = async (
    messageContent: Message.User["content"],
  ): ResultPromise<
    TypescriptModule,
    | WriteTypescriptModuleToolNotCalled
    | TooManyFailedImplementationAttempts
    | UnexpectedError
  > => {
    const [part] = messageContent;

    let userRequest: string;
    if (part.type === MessageContentPartType.Audio) {
      const sttResult = await stt(part.audio);
      if (!sttResult.success) {
        return sttResult;
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

    return implementTypescriptModule({
      description: `
This module implements and default-exports a single-file React app for
visualizing the documents in the following collections:

${targetCollectionsSnippet}
      `.trim(),
      rules: `
- Break the implementation into focused components, each handling a distinct
  part of the UI or a specific piece of logic.
      `.trim(),
      additionalInstructions: `
- Don't include a top-level title for the App.
- Don't use top-level padding/margin.
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
  };

  return { isPending, mutate };
}
