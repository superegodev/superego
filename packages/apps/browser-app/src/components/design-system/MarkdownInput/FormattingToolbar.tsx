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
import type OverTypeEditor from "./OverTypeEditor.js";

interface Props {
  editor: OverTypeEditor;
}
export default function FormattingToolbar({ editor }: Props) {
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
          onPress={() => editor.performAction("toggleBold")}
        >
          <PiTextBBold />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Italic" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editor.performAction("toggleItalic")}
        >
          <PiTextItalic />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Code" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editor.performAction("toggleCode")}
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
          onPress={() => editor.performAction("insertLink")}
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
          onPress={() => editor.performAction("toggleH1")}
        >
          <PiTextHOne />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Heading 2" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editor.performAction("toggleH2")}
        >
          <PiTextHTwo />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Heading 3" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editor.performAction("toggleH3")}
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
          onPress={() => editor.performAction("toggleBulletList")}
        >
          <PiListBullets />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Numbered list" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editor.performAction("toggleNumberedList")}
        >
          <PiListNumbers />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Task list" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          onPress={() => editor.performAction("toggleTaskList")}
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
          onPress={() => editor.performAction("toggleQuote")}
        >
          <PiQuotes />
        </IconButton>
      </Group>
    </Toolbar>
  );
}
