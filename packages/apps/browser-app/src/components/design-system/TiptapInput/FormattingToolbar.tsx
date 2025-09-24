import {
  type Editor,
  type EditorStateSnapshot,
  useEditorState,
} from "@tiptap/react";
import { Group, Separator, Toolbar } from "react-aria-components";
import {
  PiArrowUUpLeft,
  PiArrowUUpRight,
  PiCode,
  PiCodeBlock,
  PiListBullets,
  PiListChecks,
  PiListNumbers,
  PiQuotes,
  PiTextAlignCenter,
  PiTextAlignJustify,
  PiTextAlignLeft,
  PiTextAlignRight,
  PiTextBBold,
  PiTextH,
  PiTextHFive,
  PiTextHFour,
  PiTextHOne,
  PiTextHSix,
  PiTextHThree,
  PiTextHTwo,
  PiTextItalic,
  PiTextStrikethrough,
  PiTextSubscript,
  PiTextSuperscript,
  PiTextUnderline,
} from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import IconButton from "../IconButton/IconButton.js";
import PopoverMenu from "../PopoverMenu/PopoverMenu.js";
import * as cs from "./TiptapInput.css.js";

function selector({ editor: e }: EditorStateSnapshot<Editor>) {
  return {
    // History
    canUndo: e.can().chain().focus().undo().run(),
    canRedo: e.can().chain().focus().redo().run(),

    // Block
    isParagraph: e.isActive("paragraph"),
    isHeading1: e.isActive("heading", { level: 1 }),
    canHeading1: e.can().chain().focus().toggleHeading({ level: 1 }).run(),
    isHeading2: e.isActive("heading", { level: 2 }),
    canHeading2: e.can().chain().focus().toggleHeading({ level: 2 }).run(),
    isHeading3: e.isActive("heading", { level: 3 }),
    canHeading3: e.can().chain().focus().toggleHeading({ level: 3 }).run(),
    isHeading4: e.isActive("heading", { level: 4 }),
    canHeading4: e.can().chain().focus().toggleHeading({ level: 4 }).run(),
    isHeading5: e.isActive("heading", { level: 5 }),
    canHeading5: e.can().chain().focus().toggleHeading({ level: 5 }).run(),
    isHeading6: e.isActive("heading", { level: 6 }),
    canHeading6: e.can().chain().focus().toggleHeading({ level: 6 }).run(),
    isBulletList: e.isActive("bulletList"),
    canBulletList: e.can().chain().focus().toggleBulletList().run(),
    isOrderedList: e.isActive("orderedList"),
    canOrderedList: e.can().chain().focus().toggleOrderedList().run(),
    isTaskList: e.isActive("taskList"),
    canTaskList: e.can().chain().focus().toggleTaskList().run(),
    isCodeBlock: e.isActive("codeBlock"),
    canCodeBlock: e.can().chain().focus().toggleCodeBlock().run(),
    isBlockquote: e.isActive("blockquote"),
    canBlockquote: e.can().chain().focus().toggleBlockquote().run(),

    // Style
    isBold: e.isActive("bold"),
    canBold: e.can().chain().focus().toggleBold().run(),
    isItalic: e.isActive("italic"),
    canItalic: e.can().chain().focus().toggleItalic().run(),
    isUnderline: e.isActive("underline"),
    canUnderline: e.can().chain().focus().toggleUnderline().run(),
    isStrike: e.isActive("strike"),
    canStrike: e.can().chain().focus().toggleStrike().run(),
    isCode: e.isActive("code"),
    canCode: e.can().chain().focus().toggleCode().run(),
    isSuperscript: e.isActive("superscript"),
    canSuperscript: e.can().chain().focus().toggleSuperscript().run(),
    isSubscript: e.isActive("subscript"),
    canSubscript: e.can().chain().focus().toggleSubscript().run(),

    // Alignment
    isAlignedLeft: e.isActive({ textAlign: "left" }),
    canAlignLeft: e.can().chain().focus().toggleTextAlign("left").run(),
    isCentered: e.isActive({ textAlign: "center" }),
    canCenter: e.can().chain().focus().toggleTextAlign("center").run(),
    isAlignedRight: e.isActive({ textAlign: "right" }),
    canAlignRight: e.can().chain().focus().toggleTextAlign("right").run(),
    isJustified: e.isActive({ textAlign: "justify" }),
    canJustify: e.can().chain().focus().toggleTextAlign("justify").run(),
  };
}

interface Props {
  editor: Editor;
  tiptapInputId: string;
}
export default function FormattingToolbar({ editor, tiptapInputId }: Props) {
  const intl = useIntl();
  const state = useEditorState({ editor, selector });
  return (
    <Toolbar
      aria-label={intl.formatMessage({ defaultMessage: "Text formatting" })}
      className={cs.FormattingToolbar.root}
    >
      <Group
        aria-label={intl.formatMessage({ defaultMessage: "History" })}
        className={cs.FormattingToolbar.group}
      >
        <IconButton
          variant="invisible"
          className={cs.FormattingToolbar.button}
          label={intl.formatMessage({ defaultMessage: "Undo" })}
          isDisabled={!state.canUndo}
          onPress={() => editor.chain().focus().undo().run()}
        >
          <PiArrowUUpLeft />
        </IconButton>
        <IconButton
          variant="invisible"
          className={cs.FormattingToolbar.button}
          label={intl.formatMessage({ defaultMessage: "Redo" })}
          isDisabled={!state.canRedo}
          onPress={() => editor.chain().focus().redo().run()}
        >
          <PiArrowUUpRight />
        </IconButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Blocks" })}
        className={cs.FormattingToolbar.group}
      >
        <PopoverMenu>
          <PopoverMenu.Trigger>
            <IconButton
              label={intl.formatMessage({
                defaultMessage: "Open headings menu",
              })}
              variant="invisible"
              className={cs.FormattingToolbar.button}
              isToggle={true}
              isSelected={
                state.isHeading1 ||
                state.isHeading2 ||
                state.isHeading3 ||
                state.isHeading4 ||
                state.isHeading5 ||
                state.isHeading6
              }
              isDisabled={
                !(
                  state.canHeading1 ||
                  state.canHeading2 ||
                  state.canHeading3 ||
                  state.canHeading4 ||
                  state.canHeading5 ||
                  state.canHeading6
                )
              }
            >
              <PiTextH />
            </IconButton>
          </PopoverMenu.Trigger>
          <PopoverMenu.Menu data-tiptap-input-id={tiptapInputId}>
            <PopoverMenu.MenuItem
              onAction={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isHeading1)]
              }
            >
              <PiTextHOne />
              <FormattedMessage defaultMessage="Heading 1" />
            </PopoverMenu.MenuItem>
            <PopoverMenu.MenuItem
              onAction={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isHeading2)]
              }
            >
              <PiTextHTwo />
              <FormattedMessage defaultMessage="Heading 2" />
            </PopoverMenu.MenuItem>
            <PopoverMenu.MenuItem
              onAction={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isHeading3)]
              }
            >
              <PiTextHThree />
              <FormattedMessage defaultMessage="Heading 3" />
            </PopoverMenu.MenuItem>
            <PopoverMenu.MenuItem
              onAction={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isHeading4)]
              }
            >
              <PiTextHFour />
              <FormattedMessage defaultMessage="Heading 4" />
            </PopoverMenu.MenuItem>
            <PopoverMenu.MenuItem
              onAction={() =>
                editor.chain().focus().toggleHeading({ level: 5 }).run()
              }
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isHeading5)]
              }
            >
              <PiTextHFive />
              <FormattedMessage defaultMessage="Heading 5" />
            </PopoverMenu.MenuItem>
            <PopoverMenu.MenuItem
              onAction={() =>
                editor.chain().focus().toggleHeading({ level: 6 }).run()
              }
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isHeading6)]
              }
            >
              <PiTextHSix />
              <FormattedMessage defaultMessage="Heading 6" />
            </PopoverMenu.MenuItem>
          </PopoverMenu.Menu>
        </PopoverMenu>
        <PopoverMenu>
          <PopoverMenu.Trigger>
            <IconButton
              label={intl.formatMessage({
                defaultMessage: "Open list menu",
              })}
              variant="invisible"
              className={cs.FormattingToolbar.button}
              isToggle={true}
              isSelected={
                state.isBulletList || state.isOrderedList || state.isTaskList
              }
            >
              <PiListBullets />
            </IconButton>
          </PopoverMenu.Trigger>
          <PopoverMenu.Menu data-tiptap-input-id={tiptapInputId}>
            <PopoverMenu.MenuItem
              onAction={() => editor.chain().focus().toggleBulletList().run()}
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isBulletList)]
              }
            >
              <PiListBullets />
              <FormattedMessage defaultMessage="Bullet list" />
            </PopoverMenu.MenuItem>
            <PopoverMenu.MenuItem
              onAction={() => editor.chain().focus().toggleOrderedList().run()}
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isOrderedList)]
              }
            >
              <PiListNumbers />
              <FormattedMessage defaultMessage="Ordered list" />
            </PopoverMenu.MenuItem>
            <PopoverMenu.MenuItem
              onAction={() => editor.chain().focus().toggleTaskList().run()}
              className={
                cs.FormattingToolbar.menuItem[itemVariant(state.isTaskList)]
              }
            >
              <PiListChecks />
              <FormattedMessage defaultMessage="Task list" />
            </PopoverMenu.MenuItem>
          </PopoverMenu.Menu>
        </PopoverMenu>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Quote" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isBlockquote}
          isDisabled={!state.canBlockquote}
          onChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <PiQuotes />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Code block" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isCodeBlock}
          isDisabled={!state.canCodeBlock}
          onChange={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <PiCodeBlock />
        </IconButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Style" })}
        className={cs.FormattingToolbar.group}
      >
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Bold" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isBold}
          isDisabled={!state.canBold}
          onChange={() => editor.chain().focus().toggleBold().run()}
        >
          <PiTextBBold />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Italic" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isItalic}
          isDisabled={!state.canItalic}
          onChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <PiTextItalic />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Strike" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isStrike}
          isDisabled={!state.canStrike}
          onChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <PiTextStrikethrough />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Underline" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isUnderline}
          isDisabled={!state.canUnderline}
          onChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <PiTextUnderline />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Code" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isCode}
          isDisabled={!state.canCode}
          onChange={() => editor.chain().focus().toggleCode().run()}
        >
          <PiCode />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Superscript" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isSuperscript}
          isDisabled={!state.canSuperscript}
          onChange={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <PiTextSuperscript />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Subscript" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isSubscript}
          isDisabled={!state.canSubscript}
          onChange={() => editor.chain().focus().toggleSubscript().run()}
        >
          <PiTextSubscript />
        </IconButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group
        aria-label={intl.formatMessage({ defaultMessage: "Alignment" })}
        className={cs.FormattingToolbar.group}
      >
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Align left" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isAlignedLeft}
          isDisabled={!state.canAlignLeft}
          onChange={() => editor.chain().focus().toggleTextAlign("left").run()}
        >
          <PiTextAlignLeft />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Center" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isCentered}
          isDisabled={!state.canCenter}
          onChange={() =>
            editor.chain().focus().toggleTextAlign("center").run()
          }
        >
          <PiTextAlignCenter />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Align right" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isAlignedRight}
          isDisabled={!state.canAlignRight}
          onChange={() => editor.chain().focus().toggleTextAlign("right").run()}
        >
          <PiTextAlignRight />
        </IconButton>
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Justify" })}
          variant="invisible"
          className={cs.FormattingToolbar.button}
          isToggle={true}
          isSelected={state.isJustified}
          isDisabled={!state.canJustify}
          onChange={() =>
            editor.chain().focus().toggleTextAlign("justify").run()
          }
        >
          <PiTextAlignJustify />
        </IconButton>
      </Group>
    </Toolbar>
  );
}

function itemVariant(isActive: boolean): "active" | "default" {
  return isActive ? "active" : "default";
}
