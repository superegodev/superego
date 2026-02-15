import type { JSONContent } from "@tiptap/react";

export default interface Props {
  value: JSONContent | null | undefined;
  onChange: (newValue: JSONContent) => void;
  onBlur?: (() => void) | undefined;
  autoFocus?: boolean | undefined;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  /**
   * react-hook-form ref callback. Used to allow the input to be focused by rhf
   * in certain circumstances.
   */
  ref?: (refObject: { focus: () => void }) => void;
  className?: string | undefined;
}
