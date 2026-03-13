import type { OverTypeInstance } from "overtype";
import type { RefObject } from "react";
import { Group, Separator, Toolbar } from "react-aria-components";
import {
  PiCode,
  PiLink,
  PiListBullets,
  PiListChecks,
  PiListNumbers,
  PiQuotes,
  PiTextBBold,
  PiTextHOne,
  PiTextHThree,
  PiTextHTwo,
  PiTextItalic,
} from "react-icons/pi";
import IconToggleButton from "../IconToggleButton/IconToggleButton.js";
import * as cs from "./MarkdownField.css.js";

interface Props {
  editorRef: RefObject<OverTypeInstance | null>;
  activeFormats: Set<string>;
}
export default function FormattingToolbar({ editorRef, activeFormats }: Props) {
  return (
    <Toolbar aria-label="Text formatting" className={cs.FormattingToolbar.root}>
      <Group aria-label="Headings" className={cs.FormattingToolbar.group}>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Heading 1"
          isSelected={activeFormats.has("header")}
          onChange={() => editorRef.current?.performAction("toggleH1")}
        >
          <PiTextHOne />
        </IconToggleButton>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Heading 2"
          isSelected={activeFormats.has("header-2")}
          onChange={() => editorRef.current?.performAction("toggleH2")}
        >
          <PiTextHTwo />
        </IconToggleButton>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Heading 3"
          isSelected={activeFormats.has("header-3")}
          onChange={() => editorRef.current?.performAction("toggleH3")}
        >
          <PiTextHThree />
        </IconToggleButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Lists" className={cs.FormattingToolbar.group}>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Bullet list"
          isSelected={activeFormats.has("bullet-list")}
          onChange={() => editorRef.current?.performAction("toggleBulletList")}
        >
          <PiListBullets />
        </IconToggleButton>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Numbered list"
          isSelected={activeFormats.has("numbered-list")}
          onChange={() =>
            editorRef.current?.performAction("toggleNumberedList")
          }
        >
          <PiListNumbers />
        </IconToggleButton>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Task list"
          isSelected={activeFormats.has("task-list")}
          onChange={() => editorRef.current?.performAction("toggleTaskList")}
        >
          <PiListChecks />
        </IconToggleButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Block" className={cs.FormattingToolbar.group}>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Quote"
          isSelected={activeFormats.has("quote")}
          onChange={() => editorRef.current?.performAction("toggleQuote")}
        >
          <PiQuotes />
        </IconToggleButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Style" className={cs.FormattingToolbar.group}>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Bold"
          isSelected={activeFormats.has("bold")}
          onChange={() => editorRef.current?.performAction("toggleBold")}
        >
          <PiTextBBold />
        </IconToggleButton>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Italic"
          isSelected={activeFormats.has("italic")}
          onChange={() => editorRef.current?.performAction("toggleItalic")}
        >
          <PiTextItalic />
        </IconToggleButton>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Code"
          isSelected={activeFormats.has("code")}
          onChange={() => editorRef.current?.performAction("toggleCode")}
        >
          <PiCode />
        </IconToggleButton>
        <IconToggleButton
          className={cs.FormattingToolbar.toggleButton}
          label="Link"
          isSelected={activeFormats.has("link")}
          onChange={() => editorRef.current?.performAction("insertLink")}
        >
          <PiLink />
        </IconToggleButton>
      </Group>
    </Toolbar>
  );
}
