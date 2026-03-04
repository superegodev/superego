import type { OverTypeInstance } from "overtype";
import type { RefObject } from "react";
import { Button, Group, Separator, Toolbar } from "react-aria-components";
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
import * as cs from "./MarkdownField.css.js";

interface Props {
  editorRef: RefObject<OverTypeInstance | null>;
}
export default function FormattingToolbar({ editorRef }: Props) {
  return (
    <Toolbar aria-label="Text formatting" className={cs.FormattingToolbar.root}>
      <Group aria-label="Style" className={cs.FormattingToolbar.group}>
        <Button
          aria-label="Bold"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleBold")}
        >
          <PiTextBBold />
        </Button>
        <Button
          aria-label="Italic"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleItalic")}
        >
          <PiTextItalic />
        </Button>
        <Button
          aria-label="Code"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleCode")}
        >
          <PiCode />
        </Button>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Link" className={cs.FormattingToolbar.group}>
        <Button
          aria-label="Link"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("insertLink")}
        >
          <PiLink />
        </Button>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Headings" className={cs.FormattingToolbar.group}>
        <Button
          aria-label="Heading 1"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleH1")}
        >
          <PiTextHOne />
        </Button>
        <Button
          aria-label="Heading 2"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleH2")}
        >
          <PiTextHTwo />
        </Button>
        <Button
          aria-label="Heading 3"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleH3")}
        >
          <PiTextHThree />
        </Button>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Lists" className={cs.FormattingToolbar.group}>
        <Button
          aria-label="Bullet list"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleBulletList")}
        >
          <PiListBullets />
        </Button>
        <Button
          aria-label="Numbered list"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleNumberedList")}
        >
          <PiListNumbers />
        </Button>
        <Button
          aria-label="Task list"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleTaskList")}
        >
          <PiListChecks />
        </Button>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Block" className={cs.FormattingToolbar.group}>
        <Button
          aria-label="Quote"
          className={cs.FormattingToolbar.button}
          onPress={() => editorRef.current?.performAction("toggleQuote")}
        >
          <PiQuotes />
        </Button>
      </Group>
    </Toolbar>
  );
}
