import { useEffect, useState } from "react";
import { type Control, type FieldValues, useFormState } from "react-hook-form";
import { useIntl } from "react-intl";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";

interface Props<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  /** Ref to the `<form>` element, required for autosave. */
  formRef?: React.RefObject<HTMLFormElement | null>;
  /**
   * Delay (ms) after which a dirty & valid form is auto-submitted. Requires
   * `formRef`.
   */
  autosaveInterval?: number;
  /**
   * Callback to enable/disable an external submit button based on dirty state.
   */
  setSubmitDisabled?: (isDisabled: boolean) => void;
  /** Whether to show an exit-warning dialog when the form is dirty. */
  triggerExitWarningWhenDirty: boolean;
  /**
   * When `true`, all effects are turned off (autosave won't fire, exit warning
   * won't show, submit stays disabled).
   */
  isDisabled?: boolean;
  /**
   * Settle delay in ms before propagating dirty state changes.
   * @default 300
   */
  debounceDelay?: number;
}
/**
 * Render-less component that subscribes to react-hook-form's `formState` and
 * runs side-effects (submit-button toggling, autosave, exit warning) in
 * isolation from the parent form component.
 *
 * By keeping these subscriptions in a separate child, the parent avoids
 * re-rendering on every `isDirty` / `isValid` change. The dirty flag is
 * debounced so that effects that propagate state to the parent only fire once
 * the user stops typing.
 */
export default function FormStateEffects<TFieldValues extends FieldValues>({
  control,
  formRef,
  autosaveInterval,
  setSubmitDisabled,
  triggerExitWarningWhenDirty,
  isDisabled = false,
  debounceDelay = 300,
}: Props<TFieldValues>) {
  const intl = useIntl();
  const { dirtyFields, isValid } = useFormState({ control });

  // Workaround for https://github.com/react-hook-form/react-hook-form/issues/13141
  // formState.isDirty can report false positives after a reset with
  // keepValues, so we derive dirty state from dirtyFields instead.
  const isDirty = Object.keys(dirtyFields).length !== 0;

  // Debounce form state so that the effects below don't propagate state changes
  // (and therefore expensive re-renders) to the parent while the user is
  // actively typing.
  const [settledIsDirty, setSettledIsDirty] = useState(false);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSettledIsDirty(isDirty);
    }, debounceDelay);
    return () => clearTimeout(timeoutId);
  }, [isDirty, debounceDelay]);

  // Enable or disable the submit button.
  useEffect(() => {
    if (setSubmitDisabled) {
      setSubmitDisabled(isDisabled || !settledIsDirty);
    }
  }, [isDisabled, settledIsDirty, setSubmitDisabled]);

  // Schedule an autosave when the form is dirty and valid. Uses the raw
  // (non-debounced) isDirty/isValid so that the effect re-triggers reliably
  // across save cycles — the debounced values can miss transitions when the
  // user types within the debounce window after a reset.
  useEffect(() => {
    if (isDisabled || !formRef || !autosaveInterval || !isDirty || !isValid) {
      return;
    }
    const timeoutId = setTimeout(
      () => formRef.current?.requestSubmit(),
      autosaveInterval,
    );
    return () => clearTimeout(timeoutId);
  }, [isDisabled, isDirty, isValid, formRef, autosaveInterval]);

  useExitWarning(
    !isDisabled && triggerExitWarningWhenDirty && settledIsDirty
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

  return null;
}
