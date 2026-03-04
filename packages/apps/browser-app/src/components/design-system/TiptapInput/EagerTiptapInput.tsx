import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import debounce from "debounce";
import { isEqual } from "es-toolkit";
import { common, createLowlight } from "lowlight";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useFocusVisible } from "react-aria";
import { useIntl } from "react-intl";
import { TIPTAP_INPUT_ON_CHANGE_DEBOUNCE } from "../../../config.js";
import classnames from "../../../utils/classnames.js";
import FormattingToolbar from "./FormattingToolbar.js";
import type Props from "./Props.js";
import * as cs from "./TiptapInput.css.js";

// This input component wraps the Tiptap editor, which manages its own internal
// state. The `value` prop is used both for the initial value and for ongoing
// synchronization (e.g., when the form resets after an external change, or when
// the nullify button sets it to `null`).
//
// Because `onChange` is debounced, there is a window where the editor's
// internal state is ahead of the form value. If the form refreshes the `value`
// prop during this window (e.g., after an auto-save), the component would
// overwrite the user's in-flight edits with the stale saved value.
//
// To prevent this, the component tracks whether it has "pending local changes"
// — changes that exist in the editor but have not yet been flushed to
// `onChange`. While pending local changes exist, incoming `value` prop updates
// are ignored — except for `null`, which is always accepted (for the nullify
// button).
export default function EagerTiptapInput({
  value,
  onChange,
  onBlur,
  autoFocus,
  isInvalid = false,
  isReadOnly = false,
  ref,
  className,
}: Props) {
  const intl = useIntl();
  const id = useId();
  const { isFocusVisible } = useFocusVisible();
  const [hasFocus, setHasFocus] = useState(autoFocus);
  const hasPendingLocalChangesRef = useRef(false);

  const extensions = useMemo(
    () => [
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
      Placeholder.configure({
        placeholder: intl.formatMessage({ defaultMessage: "Write..." }),
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
    [intl],
  );

  const editor = useEditor({
    extensions: extensions,
    editorProps: {
      attributes: {
        class: cs.TiptapInput.editor,
      },
    },
    content: value,
    autofocus: autoFocus ?? false,
    editable: !isReadOnly,
    onUpdate: (() => {
      const debouncedOnChange = debounce(({ editor }: { editor: Editor }) => {
        hasPendingLocalChangesRef.current = false;
        const newValue = editor.getJSON();
        // TipTap considers an editor that only contains newlines as empty. For
        // us, this is not empty, hence the additional check on content.length.
        onChange(
          editor.isEmpty && newValue.content.length === 1 ? null : newValue,
        );
      }, TIPTAP_INPUT_ON_CHANGE_DEBOUNCE);
      return (args: { editor: Editor }) => {
        hasPendingLocalChangesRef.current = true;
        debouncedOnChange(args);
      };
    })(),
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

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
    if (!isEqual(editor.getJSON(), value)) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const rootElementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (rootElementRef.current && ref) {
      ref({
        focus: () => {
          if (!rootElementRef.current?.contains(document.activeElement)) {
            editor.commands.focus();
          }
        },
      });
    }
  }, [ref, editor]);

  return (
    <div
      ref={rootElementRef}
      onFocus={() => setHasFocus(true)}
      // A blur event (technically, a focusout) is emitted every time either
      // this element or any of its children lose focus. This means that we also
      // get blur events when the focus passes to:
      //
      // - A child element of the FormattingToolbar.
      // - A portalled element of the FormattingToolbar (i.e., one of its
      //   menus).
      //
      // We don't want to trigger onBlur when that occurs. We only trigger it
      // when the element which will receive focus is an "outside" element.
      onBlur={(evt) => {
        const focusPassedToChild = rootElementRef.current?.contains(
          evt.relatedTarget,
        );
        const focusPassedToPortalled =
          // Focus is not un-set (passed to no element).
          evt.relatedTarget !== null &&
          // Focus is passed to a portalled element of _this_ TiptapInput.
          evt.relatedTarget.closest(`[data-tiptap-input-id="${id}"]`);
        if (!(focusPassedToChild || focusPassedToPortalled)) {
          setHasFocus(false);
          onBlur?.();
        }
      }}
      aria-invalid={isInvalid}
      data-has-focus={hasFocus}
      data-focus-visible={hasFocus && isFocusVisible}
      data-read-only={isReadOnly}
      className={classnames(cs.TiptapInput.root, className)}
    >
      {!isReadOnly ? (
        <FormattingToolbar editor={editor} tiptapInputId={id} />
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
