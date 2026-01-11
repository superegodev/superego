import type { TypescriptFile, TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import type IncludedGlobalUtils from "./typescript/IncludedGlobalUtils.js";
import type UndoRedo from "./UndoRedo.js";

type Props = {
  onBlur?: (() => void) | undefined;
  undoRedo?: UndoRedo | undefined;
  autoFocus?: boolean | undefined;
  isInvalid?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  maxHeight?: Property.MaxHeight;
  ariaLabel?: string | undefined;
  className?: string | undefined;
  /**
   * react-hook-form ref callback. Used to allow the input to be focused by rhf
   * in certain circumstances.
   */
  ref?: (refObject: { focus: () => void }) => void;
} & (
  | {
      language: "typescript" | "typescript-jsx";
      value: TypescriptModule;
      onChange: (newValue: TypescriptModule) => void;
      typescriptLibs?: TypescriptFile[] | undefined;
      includedGlobalUtils?: IncludedGlobalUtils | undefined;
      filePath?: `/${string}.ts` | `/${string}.tsx`;
      assistantImplementation?:
        | {
            description: string;
            rules?: string | undefined;
            additionalInstructions?: string | undefined;
            template: string;
            userRequest: string;
          }
        | undefined;
    }
  | {
      language: "json";
      value: string;
      onChange: (newValue: string) => void;
      typescriptLibs?: never;
      includedGlobalUtils?: never;
      filePath?: `/${string}.json`;
      assistantImplementation?: never;
    }
);

export default Props;
