import type { TypescriptFile, TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import type IncludedGlobalUtils from "./typescript/IncludedGlobalUtils.js";

type Props = {
  onBlur?: (() => void) | undefined;
  autoFocus?: boolean | undefined;
  isInvalid?: boolean | undefined;
  isDisabled?: boolean | undefined;
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
      language: "typescript";
      value: TypescriptModule;
      onChange: (newValue: TypescriptModule) => void;
      typescriptLibs?: TypescriptFile[] | undefined;
      includedGlobalUtils?: IncludedGlobalUtils | undefined;
      fileName?: `${string}.ts`;
      assistantImplementation?:
        | { instructions: string; template: string }
        | undefined;
    }
  | {
      language: "json";
      value: string;
      onChange: (newValue: string) => void;
      typescriptLibs?: never;
      includedGlobalUtils?: never;
      fileName?: `${string}.json`;
      assistantImplementation?: never;
    }
);

export default Props;
