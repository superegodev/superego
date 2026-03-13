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
import { useIntl } from "react-intl";
import IconToggleButton from "../IconToggleButton/IconToggleButton.js";
import * as cs from "./MarkdownInput.css.js";

interface Props {
  editorRef: RefObject<OverTypeInstance | null>;
  activeFormats: Set<string>;
}
export default function FormattingToolbar({ editorRef, activeFormats }: Props) {
  const intl = useIntl();
  return (
    <Toolbar
      aria-label={intl.formatMessage({ defaultMessage: "Text formatting" })}
      className={cs.FormattingToolbar.root}
    >
      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Headings" })}
        className={cs.FormattingToolbar.group}
      >
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Heading 1" })}
          className={cs.FormattingToolbar.button}
          isSelected={activeFormats.has("header")}
          onChange={() => editorRef.current?.performAction("toggleH1")}
        >
          <PiTextHOne />
        </IconToggleButton>
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Heading 2" })}
          className={cs.FormattingToolbar.button}
          isSelected={activeFormats.has("header-2")}
          onChange={() => editorRef.current?.performAction("toggleH2")}
        >
          <PiTextHTwo />
        </IconToggleButton>
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Heading 3" })}
          className={cs.FormattingToolbar.button}
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

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Lists" })}
        className={cs.FormattingToolbar.group}
      >
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Bullet list" })}
          className={cs.FormattingToolbar.button}
          isSelected={activeFormats.has("bullet-list")}
          onChange={() => editorRef.current?.performAction("toggleBulletList")}
        >
          <PiListBullets />
        </IconToggleButton>
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Numbered list" })}
          className={cs.FormattingToolbar.button}
          isSelected={activeFormats.has("numbered-list")}
          onChange={() =>
            editorRef.current?.performAction("toggleNumberedList")
          }
        >
          <PiListNumbers />
        </IconToggleButton>
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Task list" })}
          className={cs.FormattingToolbar.button}
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

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Block" })}
        className={cs.FormattingToolbar.group}
      >
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Quote" })}
          className={cs.FormattingToolbar.button}
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

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Style" })}
        className={cs.FormattingToolbar.group}
      >
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Bold" })}
          className={cs.FormattingToolbar.button}
          isSelected={activeFormats.has("bold")}
          onChange={() => editorRef.current?.performAction("toggleBold")}
        >
          <PiTextBBold />
        </IconToggleButton>
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Italic" })}
          className={cs.FormattingToolbar.button}
          isSelected={activeFormats.has("italic")}
          onChange={() => editorRef.current?.performAction("toggleItalic")}
        >
          <PiTextItalic />
        </IconToggleButton>
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Code" })}
          className={cs.FormattingToolbar.button}
          isSelected={activeFormats.has("code")}
          onChange={() => editorRef.current?.performAction("toggleCode")}
        >
          <PiCode />
        </IconToggleButton>
        <IconToggleButton
          label={intl.formatMessage({ defaultMessage: "Link" })}
          className={cs.FormattingToolbar.button}
          isSelected={activeFormats.has("link")}
          onChange={() => editorRef.current?.performAction("insertLink")}
        >
          <PiLink />
        </IconToggleButton>
      </Group>
    </Toolbar>
  );
}
