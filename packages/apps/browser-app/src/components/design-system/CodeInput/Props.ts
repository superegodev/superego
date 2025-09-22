import type { TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import type IncludedGlobalUtils from "./typescript/IncludedGlobalUtils.js";
import type TypescriptLib from "./typescript/TypescriptLib.js";

type Props = {
  onBlur?: (() => void) | undefined;
  autoFocus?: boolean | undefined;
  isInvalid?: boolean | undefined;
  isDisabled?: boolean | undefined;
  maxHeight?: Property.MaxHeight;
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
      typescriptLibs?: TypescriptLib[] | undefined;
      includedGlobalUtils?: IncludedGlobalUtils | undefined;
      fileName?: `${string}.ts`;
    }
  | {
      language: "json";
      value: string;
      onChange: (newValue: string) => void;
      typescriptLibs?: never;
      includedGlobalUtils?: never;
      fileName?: `${string}.json`;
    }
);

export default Props;
