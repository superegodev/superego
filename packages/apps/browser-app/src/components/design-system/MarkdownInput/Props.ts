export default interface Props {
  value: string | null | undefined;
  onChange: (newValue: string) => void;
  onBlur?: (() => void) | undefined;
  id?: string | undefined;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  showToolbar?: boolean | undefined;
  placeholder?: string | undefined;
  /**
   * react-hook-form ref callback. Used to allow the input to be focused by rhf
   * in certain circumstances.
   */
  ref?: (refObject: { focus: () => void }) => void;
}
