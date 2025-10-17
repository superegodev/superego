import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const JsonObjectField = {
  TiptapRichText: {
    root: style({
      display: "flex",
      flexDirection: "column",
      marginBlockEnd: vars.spacing._6,
    }),
  },
  Default: {
    textArea: style({
      fontFamily: vars.typography.fontFamilies.monospace,
    }),
  },
};

export const FileField = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),

  legend: style({
    borderBlockEnd: "0 !important",
    marginBlockEnd: "0 !important",
  }),

  fields: style({
    paddingInlineStart: "0 !important",
    marginBlockEnd: vars.spacing._6,
    selectors: {
      ':not(:last-child) > [data-is-list-item="true"] &': {
        marginBlockEnd: 0,
      },
    },
  }),

  dropZone: style({
    width: "100%",
  }),

  nullFileFieldsFileTrigger: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin} + 0.5px)`,
    paddingInline: 0,
    color: vars.colors.text.secondary,
    fontStyle: "italic",
    border: `${vars.borders.width.thin} dashed ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    marginBlockEnd: vars.spacing._2,
    selectors: {
      "&:hover": {
        color: vars.colors.text.secondary,
      },
      '[data-drop-target="true"] &': {
        borderColor: vars.colors.accent,
        borderWidth: vars.borders.width.medium,
      },
    },
  }),

  nonNullFileFieldsRoot: style({
    display: "grid",
    gridTemplateColumns: "auto 3fr 2fr auto",
    columnGap: vars.spacing._2,
  }),

  nonNullFileIcon: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: vars.spacing._6,
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin} + 0.5px)`,
    fontSize: vars.typography.fontSizes.xl3,
    marginBlockEnd: vars.spacing._2,
  }),

  nonNullFileTextField: style({
    marginBlockEnd: "0",
  }),

  nonNullFileButtons: style({
    display: "flex",
    columnGap: vars.spacing._2,
    marginBlockEnd: vars.spacing._2,
  }),

  nonNullFileButton: style({
    aspectRatio: "1 / 1",
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin} + 0.5px)`,
  }),
};

export const StructAndListField = {
  nullValueFields: style({
    paddingInlineStart: 0,
  }),
  nullValueSetValueButton: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin})`,
    paddingInline: 0,
    color: vars.colors.text.secondary,
    fontStyle: "italic",
    border: `${vars.borders.width.thin} dashed ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    marginBlockEnd: vars.spacing._8,
    selectors: {
      "&:hover": {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

export const ListField = {
  emptyItemsPlaceholder: style({
    display: "flex",
    justifyContent: "center",
    lineHeight: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin})`,
    fontSize: vars.typography.fontSizes.sm,
    fontStyle: "italic",
    color: vars.colors.text.secondary,
    marginBlockEnd: vars.spacing._8,
  }),
  item: style({
    position: "relative",
  }),
  itemActions: style({
    position: "absolute",
    top: `calc(${vars.spacing._1} + ${vars.borders.width.thin})`,
    transform: "translateX(-100%)",
    paddingInlineEnd: vars.spacing._2,
    opacity: 0,
    selectors: {
      ":hover > &": {
        opacity: 1,
        transition: "opacity 300ms ease",
      },
      "&:has(:focus)": {
        opacity: 1,
      },
      [`
        div:has(> [data-data-type="Boolean"]) > &,
        div:has(> [data-data-type="Struct"]) > &,
        div:has(> [data-data-type="List"]) > &
      `]: {
        top: `calc(-1 * ${vars.spacing._1})`,
      },
    },
  }),
  itemAction: style({
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.secondary,
    selectors: {
      "&:hover": {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

export const ListItemField = {
  root: style({
    selectors: {
      ":not(:last-child) > &": {
        marginBlockEnd: 0,
      },
      ':not(:last-child) > &[data-data-type="Boolean"]': {
        marginBlockEnd: vars.spacing._2,
      },
    },
  }),
};

export const NullifyFieldAction = {
  root: style({
    zIndex: 9999,
    selectors: {
      "&:hover": {
        background: vars.colors.background.surface,
        borderRadius: vars.borders.radius.full,
      },
    },
  }),
};

export const Field = {
  root: style({
    position: "relative",
    selectors: {
      [`&:has(${NullifyFieldAction.root}:hover)::before`]: {
        zIndex: 99,
        opacity: 0.2,
      },
      "&::before": {
        zIndex: -1,
        content: "",
        position: "absolute",
        top: `calc(-1 * ${vars.spacing._2})`,
        bottom: 0,
        left: `calc(-1 * ${vars.spacing._2})`,
        right: `calc(-1 * ${vars.spacing._2})`,
        background: vars.colors.reds._4,
        borderRadius: vars.borders.radius.md,
        opacity: 0,
        transition: "opacity 200ms ease",
        transitionDelay: "300ms",
        pointerEvents: "none",
      },
      "&:is(fieldset)::before": {
        top: `calc(-1 * ${vars.spacing._12})`,
        bottom: vars.spacing._6,
      },
    },
  }),
};

export const AnyFieldLabel = {
  dataType: style({
    fontFamily: vars.typography.fontFamilies.monospace,
    fontSize: vars.typography.fontSizes.xs,
    marginInlineStart: vars.spacing._2,
    color: vars.colors.text.secondary,
    borderRadius: vars.borders.radius.full,
  }),

  tooltipTrigger: style({
    background: "transparent",
    border: 0,
    padding: 0,
    margin: 0,
    position: "relative",
    fontFamily: "serif",
    marginInlineStart: vars.spacing._1,
  }),

  nonNullableAsterisk: style({
    color: vars.colors.reds._5,
  }),
};
