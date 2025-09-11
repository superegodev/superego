import type { TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import type TypescriptLib from "./TypescriptLib.js";

export default interface Props {
  value: TypescriptModule;
  onChange: (newValue: TypescriptModule) => void;
  onBlur?: (() => void) | undefined;
  autoFocus?: boolean | undefined;
  isInvalid?: boolean | undefined;
  isDisabled?: boolean | undefined;
  typescriptLibs?: TypescriptLib[] | undefined;
  maxHeight?: Property.MaxHeight;
  /**
   * react-hook-form ref callback. Used to allow the input to be focused by rhf
   * in certain circumstances.
   */
  ref?: (refObject: { focus: () => void }) => void;
}
