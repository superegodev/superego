import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const TiptapInput = {
  root: style({
    width: "100%",
    minHeight: vars.spacing._40,
    overflow: "auto",
    border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    background: vars.colors.background.surface,
    selectors: {
      '&[data-has-focus="true"][data-focus-visible="true"]': {
        outline: `2px solid ${vars.colors.accent}`,
        outlineOffset: "-1px",
      },
      '&[aria-invalid="true"]': {
        borderColor: vars.colors.semantic.error.border,
      },
    },
  }),

  editor: style({
    width: "100%",
    whiteSpace: "pre-wrap",
    fontSize: vars.typography.fontSizes.md,
    padding: vars.spacing._4,
    paddingBlockStart: vars.spacing._2,
    selectors: {
      "&:focus-visible": {
        outline: "none",
      },
    },
  }),
};

const formattingMenuItemBase = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing._2,
  cursor: "pointer",
});
export const FormattingToolbar = {
  root: style({
    position: "sticky",
    top: 0,
    zIndex: 1,
    width: "100%",
    overflow: "auto",
    display: "flex",
    gap: vars.spacing._2,
    paddingInline: vars.spacing._4,
    paddingBlockStart: vars.spacing._4,
    paddingBlockEnd: vars.spacing._2,
    background: `linear-gradient(180deg, ${vars.colors.background.surface} 0%, ${vars.colors.background.surface} 90%, rgb(from ${vars.colors.background.surface} r g b / 0) 100%)`,
  }),

  group: style({
    display: "flex",
    gap: vars.spacing._0_5,
  }),

  separator: style({
    alignSelf: "stretch",
    background: vars.colors.border.default,
    width: vars.borders.width.thin,
  }),

  menuItem: styleVariants({
    default: [formattingMenuItemBase],
    active: [
      formattingMenuItemBase,
      {
        border: `${vars.borders.width.thin} solid ${vars.colors.border.strong}`,
      },
    ],
  }),

  button: style({
    fontSize: vars.typography.fontSizes.xl,
  }),
};

////////////////////////////////////////////
// Styles for elements inside the editor. //
////////////////////////////////////////////

globalStyle(`${TiptapInput.editor} > :first-child`, {
  marginBlockStart: 0,
});
globalStyle(`${TiptapInput.editor} > :last-child`, {
  marginBlockEnd: 0,
});

// Lists.
globalStyle(`${TiptapInput.editor} ul, ${TiptapInput.editor} ol`, {
  paddingBlock: 0,
  paddingInline: vars.spacing._4,
  marginBlockStart: vars.spacing._5,
  marginBlockEnd: vars.spacing._5,
  marginInlineStart: vars.spacing._2,
  marginInlineEnd: vars.spacing._4,
});
globalStyle(`${TiptapInput.editor} ul li p, ${TiptapInput.editor} ol li p`, {
  marginBlockStart: vars.spacing._1,
  marginBlockEnd: vars.spacing._1,
});
globalStyle(`${TiptapInput.editor} ul[data-type="taskList"]`, {
  listStyle: "none",
  marginInlineStart: 0,
  padding: 0,
});
globalStyle(
  `${TiptapInput.editor} ul[data-type="taskList"] ul[data-type="taskList"]`,
  {
    margin: 0,
  },
);
globalStyle(`${TiptapInput.editor} ul[data-type="taskList"] li`, {
  display: "flex",
  alignItems: "flex-start",
});
globalStyle(`${TiptapInput.editor} ul[data-type="taskList"] li > label`, {
  flex: "0 0 auto",
  marginBlockStart: `calc(${vars.spacing._1} + 1px)`,
  marginInlineEnd: vars.spacing._1,
  userSelect: "none",
});
globalStyle(`${TiptapInput.editor} ul[data-type="taskList"] li > div`, {
  flex: "1 1 auto",
});
globalStyle(
  `${TiptapInput.editor} ul[data-type="taskList"] input[type="checkbox"]`,
  {
    cursor: "pointer",
  },
);

// Inline code.
globalStyle(`${TiptapInput.editor} p code`, {
  background: vars.colors.oranges._1,
  border: `${vars.borders.width.thin} solid ${vars.colors.oranges._3}`,
  borderRadius: vars.borders.radius.md,
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSizes.sm,
  paddingInline: vars.spacing._1,
  paddingBlock: vars.spacing._0_5,
});

// Code blocks. Uses the highlight.js github-dark theme.
globalStyle(`${TiptapInput.editor} pre`, {
  background: vars.colors.greys._10,
  borderRadius: vars.borders.radius.md,
  color: vars.colors.greys._2,
  fontFamily: vars.typography.fontFamilies.monospace,
  marginBlock: vars.spacing._6,
  marginInline: 0,
  paddingBlock: vars.spacing._3,
  paddingInline: vars.spacing._4,
});
globalStyle(`${TiptapInput.editor} pre code`, {
  background: "none",
  color: "inherit",
  fontSize: vars.typography.fontSizes.md,
  padding: 0,
});
globalStyle(`${TiptapInput.editor} .hljs`, {
  color: "#c9d1d9",
  background: "#0d1117",
});
globalStyle(
  `${TiptapInput.editor} .hljs-doctag, ${TiptapInput.editor} .hljs-keyword, ${TiptapInput.editor} .hljs-meta .hljs-keyword, ${TiptapInput.editor} .hljs-template-tag, ${TiptapInput.editor} .hljs-template-variable, ${TiptapInput.editor} .hljs-type, ${TiptapInput.editor} .hljs-variable.language_`,
  {
    color: "#ff7b72",
  },
);
globalStyle(
  `${TiptapInput.editor} .hljs-title, ${TiptapInput.editor} .hljs-title.class_, ${TiptapInput.editor} .hljs-title.class_.inherited__, ${TiptapInput.editor} .hljs-title.function_`,
  {
    color: "#d2a8ff",
  },
);
globalStyle(
  `${TiptapInput.editor} .hljs-attr, ${TiptapInput.editor} .hljs-attribute, ${TiptapInput.editor} .hljs-literal, ${TiptapInput.editor} .hljs-meta, ${TiptapInput.editor} .hljs-number, ${TiptapInput.editor} .hljs-operator, ${TiptapInput.editor} .hljs-variable, ${TiptapInput.editor} .hljs-selector-attr, ${TiptapInput.editor} .hljs-selector-class, ${TiptapInput.editor} .hljs-selector-id`,
  {
    color: "#79c0ff",
  },
);
globalStyle(
  `${TiptapInput.editor} .hljs-regexp, ${TiptapInput.editor} .hljs-string, ${TiptapInput.editor} .hljs-meta .hljs-string`,
  {
    color: "#a5d6ff",
  },
);
globalStyle(
  `${TiptapInput.editor} .hljs-built_in, ${TiptapInput.editor} .hljs-symbol`,
  {
    color: "#ffa657",
  },
);
globalStyle(
  `${TiptapInput.editor} .hljs-comment, ${TiptapInput.editor} .hljs-code, ${TiptapInput.editor} .hljs-formula`,
  {
    color: "#8b949e",
  },
);
globalStyle(
  `${TiptapInput.editor} .hljs-name, ${TiptapInput.editor} .hljs-quote, ${TiptapInput.editor} .hljs-selector-tag, ${TiptapInput.editor} .hljs-selector-pseudo`,
  {
    color: "#7ee787",
  },
);
globalStyle(`${TiptapInput.editor} .hljs-subst`, {
  color: "#c9d1d9",
});
globalStyle(`${TiptapInput.editor} .hljs-section`, {
  color: "#1f6feb",
  fontWeight: "bold",
});
globalStyle(`${TiptapInput.editor} .hljs-bullet`, {
  color: "#f2cc60",
});
globalStyle(`${TiptapInput.editor} .hljs-emphasis`, {
  color: "#c9d1d9",
  fontStyle: "italic",
});
globalStyle(`${TiptapInput.editor} .hljs-strong`, {
  color: "#c9d1d9",
  fontWeight: "bold",
});
globalStyle(`${TiptapInput.editor} .hljs-addition`, {
  color: "#aff5b4",
  backgroundColor: "#033a16",
});
globalStyle(`${TiptapInput.editor} .hljs-deletion`, {
  color: "#ffdcd7",
  backgroundColor: "#67060c",
});

// Blockquote.
globalStyle(`${TiptapInput.editor} blockquote`, {
  borderInlineStart: `${vars.borders.width.thick} solid ${vars.colors.border.default}`,
  marginBlock: vars.spacing._6,
  marginInline: 0,
  paddingInlineStart: vars.spacing._3,
});

// Placeholder.
globalStyle(`${TiptapInput.editor} p.is-empty::before`, {
  color: vars.colors.text.secondary,
  content: "attr(data-placeholder)",
  float: "left",
  height: 0,
  pointerEvents: "none",
});
