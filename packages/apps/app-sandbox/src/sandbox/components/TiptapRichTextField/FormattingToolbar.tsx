import {
  type Editor,
  type EditorStateSnapshot,
  useEditorState,
} from "@tiptap/react";
import {
  Button,
  Group,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Separator,
  ToggleButton,
  Toolbar,
} from "react-aria-components";
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
import * as cs from "./TiptapRichTextField.css.js";

function selector({ editor: e }: EditorStateSnapshot<Editor>) {
  return {
    // History
    canUndo: e.can().chain().focus().undo().run(),
    canRedo: e.can().chain().focus().redo().run(),

    // Block
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

function toggleVariant(isSelected: boolean): "selected" | "default" {
  return isSelected ? "selected" : "default";
}

function menuItemVariant(isActive: boolean): "active" | "default" {
  return isActive ? "active" : "default";
}

interface Props {
  editor: Editor;
  tiptapInputId: string;
}
export default function FormattingToolbar({ editor, tiptapInputId }: Props) {
  const state = useEditorState({ editor, selector });
  return (
    <Toolbar aria-label="Text formatting" className={cs.FormattingToolbar.root}>
      <Group aria-label="History" className={cs.FormattingToolbar.group}>
        <Button
          aria-label="Undo"
          className={cs.FormattingToolbar.button}
          isDisabled={!state.canUndo}
          onPress={() => editor.chain().focus().undo().run()}
        >
          <PiArrowUUpLeft />
        </Button>
        <Button
          aria-label="Redo"
          className={cs.FormattingToolbar.button}
          isDisabled={!state.canRedo}
          onPress={() => editor.chain().focus().redo().run()}
        >
          <PiArrowUUpRight />
        </Button>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Blocks" className={cs.FormattingToolbar.group}>
        <MenuTrigger>
          <Button
            aria-label="Headings"
            className={
              cs.FormattingToolbar.toggleButton[
                toggleVariant(
                  state.isHeading1 ||
                    state.isHeading2 ||
                    state.isHeading3 ||
                    state.isHeading4 ||
                    state.isHeading5 ||
                    state.isHeading6,
                )
              ]
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
          </Button>
          <Popover data-tiptap-input-id={tiptapInputId}>
            <Menu className={cs.FormattingToolbar.menu}>
              <MenuItem
                onAction={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isHeading1)
                  ]
                }
              >
                <PiTextHOne /> Heading 1
              </MenuItem>
              <MenuItem
                onAction={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isHeading2)
                  ]
                }
              >
                <PiTextHTwo /> Heading 2
              </MenuItem>
              <MenuItem
                onAction={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isHeading3)
                  ]
                }
              >
                <PiTextHThree /> Heading 3
              </MenuItem>
              <MenuItem
                onAction={() =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isHeading4)
                  ]
                }
              >
                <PiTextHFour /> Heading 4
              </MenuItem>
              <MenuItem
                onAction={() =>
                  editor.chain().focus().toggleHeading({ level: 5 }).run()
                }
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isHeading5)
                  ]
                }
              >
                <PiTextHFive /> Heading 5
              </MenuItem>
              <MenuItem
                onAction={() =>
                  editor.chain().focus().toggleHeading({ level: 6 }).run()
                }
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isHeading6)
                  ]
                }
              >
                <PiTextHSix /> Heading 6
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
        <MenuTrigger>
          <Button
            aria-label="Lists"
            className={
              cs.FormattingToolbar.toggleButton[
                toggleVariant(
                  state.isBulletList || state.isOrderedList || state.isTaskList,
                )
              ]
            }
          >
            <PiListBullets />
          </Button>
          <Popover data-tiptap-input-id={tiptapInputId}>
            <Menu className={cs.FormattingToolbar.menu}>
              <MenuItem
                onAction={() => editor.chain().focus().toggleBulletList().run()}
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isBulletList)
                  ]
                }
              >
                <PiListBullets /> Bullet list
              </MenuItem>
              <MenuItem
                onAction={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isOrderedList)
                  ]
                }
              >
                <PiListNumbers /> Ordered list
              </MenuItem>
              <MenuItem
                onAction={() => editor.chain().focus().toggleTaskList().run()}
                className={
                  cs.FormattingToolbar.menuItem[
                    menuItemVariant(state.isTaskList)
                  ]
                }
              >
                <PiListChecks /> Task list
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
        <ToggleButton
          aria-label="Quote"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isBlockquote)]
          }
          isSelected={state.isBlockquote}
          isDisabled={!state.canBlockquote}
          onChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <PiQuotes />
        </ToggleButton>
        <ToggleButton
          aria-label="Code block"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isCodeBlock)]
          }
          isSelected={state.isCodeBlock}
          isDisabled={!state.canCodeBlock}
          onChange={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <PiCodeBlock />
        </ToggleButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Style" className={cs.FormattingToolbar.group}>
        <ToggleButton
          aria-label="Bold"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isBold)]
          }
          isSelected={state.isBold}
          isDisabled={!state.canBold}
          onChange={() => editor.chain().focus().toggleBold().run()}
        >
          <PiTextBBold />
        </ToggleButton>
        <ToggleButton
          aria-label="Italic"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isItalic)]
          }
          isSelected={state.isItalic}
          isDisabled={!state.canItalic}
          onChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <PiTextItalic />
        </ToggleButton>
        <ToggleButton
          aria-label="Strike"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isStrike)]
          }
          isSelected={state.isStrike}
          isDisabled={!state.canStrike}
          onChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <PiTextStrikethrough />
        </ToggleButton>
        <ToggleButton
          aria-label="Underline"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isUnderline)]
          }
          isSelected={state.isUnderline}
          isDisabled={!state.canUnderline}
          onChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <PiTextUnderline />
        </ToggleButton>
        <ToggleButton
          aria-label="Code"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isCode)]
          }
          isSelected={state.isCode}
          isDisabled={!state.canCode}
          onChange={() => editor.chain().focus().toggleCode().run()}
        >
          <PiCode />
        </ToggleButton>
        <ToggleButton
          aria-label="Superscript"
          className={
            cs.FormattingToolbar.toggleButton[
              toggleVariant(state.isSuperscript)
            ]
          }
          isSelected={state.isSuperscript}
          isDisabled={!state.canSuperscript}
          onChange={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <PiTextSuperscript />
        </ToggleButton>
        <ToggleButton
          aria-label="Subscript"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isSubscript)]
          }
          isSelected={state.isSubscript}
          isDisabled={!state.canSubscript}
          onChange={() => editor.chain().focus().toggleSubscript().run()}
        >
          <PiTextSubscript />
        </ToggleButton>
      </Group>

      <Separator
        orientation="vertical"
        className={cs.FormattingToolbar.separator}
      />

      <Group aria-label="Alignment" className={cs.FormattingToolbar.group}>
        <ToggleButton
          aria-label="Align left"
          className={
            cs.FormattingToolbar.toggleButton[
              toggleVariant(state.isAlignedLeft)
            ]
          }
          isSelected={state.isAlignedLeft}
          isDisabled={!state.canAlignLeft}
          onChange={() => editor.chain().focus().toggleTextAlign("left").run()}
        >
          <PiTextAlignLeft />
        </ToggleButton>
        <ToggleButton
          aria-label="Center"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isCentered)]
          }
          isSelected={state.isCentered}
          isDisabled={!state.canCenter}
          onChange={() =>
            editor.chain().focus().toggleTextAlign("center").run()
          }
        >
          <PiTextAlignCenter />
        </ToggleButton>
        <ToggleButton
          aria-label="Align right"
          className={
            cs.FormattingToolbar.toggleButton[
              toggleVariant(state.isAlignedRight)
            ]
          }
          isSelected={state.isAlignedRight}
          isDisabled={!state.canAlignRight}
          onChange={() => editor.chain().focus().toggleTextAlign("right").run()}
        >
          <PiTextAlignRight />
        </ToggleButton>
        <ToggleButton
          aria-label="Justify"
          className={
            cs.FormattingToolbar.toggleButton[toggleVariant(state.isJustified)]
          }
          isSelected={state.isJustified}
          isDisabled={!state.canJustify}
          onChange={() =>
            editor.chain().focus().toggleTextAlign("justify").run()
          }
        >
          <PiTextAlignJustify />
        </ToggleButton>
      </Group>
    </Toolbar>
  );
}
