import type ExcalidrawDrawingValue from "./ExcalidrawDrawingValue.js";

export default interface Props {
  value: ExcalidrawDrawingValue | null | undefined;
  onChange: (newValue: ExcalidrawDrawingValue) => void;
  onBlur?: (() => void) | undefined;
  autoFocus?: boolean | undefined;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  /**
   * react-hook-form ref callback. Used to allow the input to be focused by rhf
   * in certain circumstances.
   */
  ref?: (refObject: { focus: () => void }) => void;
}
