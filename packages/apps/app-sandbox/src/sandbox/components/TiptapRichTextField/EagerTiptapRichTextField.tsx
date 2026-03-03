import { DataType } from "@superego/schema";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import debounce from "debounce";
import { isEqual } from "es-toolkit";
import { common, createLowlight } from "lowlight";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useFocusVisible } from "react-aria";
import Description from "../forms/Description.js";
import Label from "../forms/Label.js";
import FormattingToolbar from "./FormattingToolbar.js";
import type Props from "./Props.js";
import * as cs from "./TiptapRichTextField.css.js";

const ON_CHANGE_DEBOUNCE = 300;

function stripBranding(
  value: Record<string, any> | null,
): Record<string, any> | null {
  if (value == null) {
    return null;
  }
  const { __dataType, ...rest } = value;
  return rest;
}

// This input component wraps the Tiptap editor, which manages its own internal
// state. The `value` prop is used both for the initial value and for ongoing
// synchronization (e.g., when the form resets after an external change).
//
// Because `onChange` is debounced, there is a window where the editor's
// internal state is ahead of the form value. If the form refreshes the `value`
// prop during this window, the component would overwrite the user's in-flight
// edits with the stale saved value.
//
// To prevent this, the component tracks whether it has "pending local changes"
// — changes that exist in the editor but have not yet been flushed to
// `onChange`. While pending local changes exist, incoming `value` prop updates
// are ignored — except for `null`, which is always accepted.
export default function EagerTiptapRichTextField({
  value,
  onChange,
  label,
  ariaLabel,
  description,
  isDisabled = false,
}: Props) {
  const id = useId();
  const { isFocusVisible } = useFocusVisible();
  const [hasFocus, setHasFocus] = useState(false);
  const hasPendingLocalChangesRef = useRef(false);

  const extensions = useMemo(
    () => [
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
      Placeholder.configure({
        placeholder: "Write...",
      }),
      StarterKit.configure({
        link: false,
        codeBlock: false,
      }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyleKit,
      Typography,
    ],
    [],
  );

  const editor = useEditor({
    extensions: extensions,
    editorProps: {
      attributes: {
        class: cs.TiptapInput.editor,
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    },
    content: stripBranding(value),
    editable: !isDisabled,
    onUpdate: (() => {
      const debouncedOnChange = debounce(({ editor }: { editor: any }) => {
        hasPendingLocalChangesRef.current = false;
        onChange(
          editor.isEmpty
            ? null
            : { ...editor.getJSON(), __dataType: DataType.JsonObject },
        );
      }, ON_CHANGE_DEBOUNCE);
      return (args: { editor: any }) => {
        hasPendingLocalChangesRef.current = true;
        debouncedOnChange(args);
      };
    })(),
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isDisabled);
    }
  }, [editor, isDisabled]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }
    if (value == null) {
      hasPendingLocalChangesRef.current = false;
      editor.commands.clearContent();
      return;
    }
    if (hasPendingLocalChangesRef.current) {
      return;
    }
    const stripped = stripBranding(value);
    if (!isEqual(editor.getJSON(), stripped)) {
      editor.commands.setContent(stripped);
    }
  }, [editor, value]);

  return (
    <div
      data-disabled={isDisabled || undefined}
      className={cs.TiptapRichTextField.root}
    >
      {label ? <Label>{label}</Label> : null}
      <div
        onFocus={() => setHasFocus(true)}
        onBlur={(evt) => {
          const rootEl = evt.currentTarget;
          const focusPassedToChild = rootEl.contains(evt.relatedTarget);
          const focusPassedToPortalled =
            evt.relatedTarget !== null &&
            evt.relatedTarget.closest(`[data-tiptap-input-id="${id}"]`);
          if (!(focusPassedToChild || focusPassedToPortalled)) {
            setHasFocus(false);
          }
        }}
        data-has-focus={hasFocus}
        data-focus-visible={hasFocus && isFocusVisible}
        data-disabled={isDisabled || undefined}
        className={cs.TiptapInput.root}
      >
        {!isDisabled && editor ? (
          <FormattingToolbar editor={editor} tiptapInputId={id} />
        ) : null}
        <EditorContent editor={editor} />
      </div>
      {description ? <Description>{description}</Description> : null}
    </div>
  );
}
