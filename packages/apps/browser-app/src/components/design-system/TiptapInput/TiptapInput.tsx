import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import debounce from "debounce";
import { common, createLowlight } from "lowlight";
import { useEffect, useId, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { TIPTAP_INPUT_ON_CHANGE_DEBOUNCE } from "../../../config.js";
import FormattingToolbar from "./FormattingToolbar.js";
import * as cs from "./TiptapInput.css.js";

interface Props {
  value: JSONContent | null | undefined;
  onChange: (newValue: JSONContent) => void;
  onBlur?: (() => void) | undefined;
  autoFocus?: boolean | undefined;
  isInvalid?: boolean | undefined;
  /**
   * react-hook-form ref callback. Used to allow the input to be focused by rhf
   * in certain circumstances.
   */
  ref?: (refObject: { focus: () => void }) => void;
}
export default function TiptapInput({
  value,
  onChange,
  onBlur,
  autoFocus,
  isInvalid = false,
  ref,
}: Props) {
  const intl = useIntl();
  const id = useId();
  const [hasFocus, setHasFocus] = useState(autoFocus);
  const [extensions] = useState(() => [
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
  ]);
  const editor = useEditor({
    extensions: extensions,
    editorProps: {
      attributes: {
        class: cs.TiptapInput.editor,
      },
    },
    content: value,
    autofocus: autoFocus ?? false,
    onUpdate: debounce(({ editor }) => {
      onChange(editor.getJSON());
    }, TIPTAP_INPUT_ON_CHANGE_DEBOUNCE),
  });
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
      className={cs.TiptapInput.root}
    >
      <FormattingToolbar editor={editor} tiptapInputId={id} />
      <EditorContent editor={editor} />
    </div>
  );
}
