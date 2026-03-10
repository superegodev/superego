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
import IconButton from "../IconButton/IconButton.js";
import * as cs from "./MarkdownInput.css.js";

interface Props {
  editorRef: RefObject<OverTypeInstance | null>;
}
export default function FormattingToolbar({ editorRef }: Props) {
  const intl = useIntl();
  return (
    <Toolbar
      aria-label={intl.formatMessage({ defaultMessage: "Text formatting" })}
      className={cs.FormattingToolbar.root}
    >
      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Style" })}
        className={cs.FormattingToolbar.group}
      >
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Bold" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleBold")}
        >
          <PiTextBBold />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Italic" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleItalic")}
        >
          <PiTextItalic />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Code" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleCode")}
        >
          <PiCode />
        </IconButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Link" })}
        className={cs.FormattingToolbar.group}
      >
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Link" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("insertLink")}
        >
          <PiLink />
        </IconButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Headings" })}
        className={cs.FormattingToolbar.group}
      >
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Heading 1" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleH1")}
        >
          <PiTextHOne />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Heading 2" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleH2")}
        >
          <PiTextHTwo />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Heading 3" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleH3")}
        >
          <PiTextHThree />
        </IconButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Lists" })}
        className={cs.FormattingToolbar.group}
      >
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Bullet list" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleBulletList")}
        >
          <PiListBullets />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Numbered list" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleNumberedList")}
        >
          <PiListNumbers />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Task list" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleTaskList")}
        >
          <PiListChecks />
        </IconButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Block" })}
        className={cs.FormattingToolbar.group}
      >
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Quote" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleQuote")}
        >
          <PiQuotes />
        </IconButton>
      </Group>
    </Toolbar>
  );
}
