import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const JsonObjectField = {
  ExcalidrawDrawing: {
    root: style({
      display: "flex",
      flexDirection: "column",
      gap: vars.spacing._2,
    }),
  },

  GeoJSON: {
    root: style({
      display: "flex",
      flexDirection: "column",
      gap: vars.spacing._2,
    }),
  },

  TiptapRichText: {
    root: style({
      display: "flex",
      flexDirection: "column",
      gap: vars.spacing._2,
    }),
  },

  Default: {
    textArea: style({
      fontFamily: vars.typography.fontFamilies.monospace,
    }),
  },
};

export const StringField = {
  Markdown: {
    root: style({
      display: "flex",
      flexDirection: "column",
      gap: vars.spacing._2,
    }),
  },

  Instant: {
    root: style({
      display: "flex",
      flexDirection: "column",
      gap: vars.spacing._2,
    }),

    fields: style({
      display: "flex",
      gap: vars.spacing._2,
    }),

    datePicker: style({
      flex: "3 0 0",
    }),

    timeField: style({
      flex: "3 0 0",
    }),

    offsetInput: style({
      flex: "1 0 0",
      selectors: {
        '&[data-invalid="true"]': {
          borderColor: vars.colors.semantic.error.border,
        },
      },
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
    paddingBlockStart: "0 !important",
  }),

  dropZone: style({
    width: "100%",
  }),

  nullFileFieldsFileTrigger: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: `calc(${vars.spacing._9} + 1px)`,
    paddingInline: 0,
    color: vars.colors.text.secondary,
    fontStyle: "italic",
    border: `${vars.borders.width.thin} dashed ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
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
    height: `calc(${vars.spacing._9} + 1px)`,
    fontSize: vars.typography.fontSizes.xl4,
  }),

  nonNullFileTextField: style({}),

  nonNullFileButtons: style({
    display: "flex",
    columnGap: vars.spacing._2,
  }),

  nonNullFileButton: style({
    aspectRatio: "1 / 1",
    height: `calc(${vars.spacing._9} + 1px)`,
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
    height: `calc(${vars.spacing._9} + 1px)`,
    paddingInline: 0,
    color: vars.colors.text.secondary,
    fontStyle: "italic",
    border: `${vars.borders.width.thin} dashed ${vars.colors.border.default}`,
    borderRadius: vars.borders.radius.md,
    selectors: {
      "&:hover": {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

export const ListField = {
  fields: style({
    gap: vars.spacing._2,
  }),

  emptyItemsPlaceholder: style({
    display: "flex",
    justifyContent: "center",
    height: `calc(${vars.spacing._9} + 1px)`,
    fontSize: vars.typography.fontSizes.md,
    fontStyle: "italic",
    color: vars.colors.text.secondary,
  }),

  item: style({
    position: "relative",
    selectors: {
      "&:not(:first-child):has(> [data-data-type='Struct']), &:not(:first-child):has(> [data-data-type='List'])":
        {
          paddingBlockStart: vars.spacing._2,
        },
    },
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
    fontSize: vars.typography.fontSizes.xl,
    color: vars.colors.text.secondary,
    selectors: {
      "&:hover": {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

export const ListItemField = {
  root: style({}),
};

export const NullifyFieldAction = {
  root: style({
    zIndex: 9999,
    fontSize: vars.typography.fontSizes.lg,
    selectors: {
      "&:hover": {
        background: vars.colors.background.surface,
        borderRadius: vars.borders.radius.full,
      },
    },
  }),
};

export const Field = {
  grow: style({
    flexGrow: 1,
    minHeight: 0,
    height: "100%",
  }),

  growContent: style({
    flexGrow: 1,
    minHeight: 0,
    height: "100%",
  }),

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
        bottom: `calc(-1 * ${vars.spacing._2})`,
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
        bottom: `calc(-1 * ${vars.spacing._2})`,
      },
    },
  }),
};

export const DocumentRefField = {
  DocumentRefField: {
    popover: style({
      width: "var(--trigger-width)",
      overflow: "auto",
      maxHeight: vars.spacing._80,
      display: "flex",
      flexDirection: "column",
      padding: 0,
    }),

    searchField: style({
      display: "flex",
      alignItems: "center",
      gap: vars.spacing._2,
      padding: vars.spacing._3,
      borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    }),

    searchFieldIcon: style({
      flexShrink: 0,
      color: vars.colors.text.secondary,
      fontSize: vars.typography.fontSizes.lg,
    }),

    searchFieldInput: style({
      flex: 1,
      border: 0,
      outline: "none !important",
      background: "transparent",
      fontSize: vars.typography.fontSizes.md,
      fontFamily: vars.typography.fontFamilies.sansSerif,
      color: vars.colors.text.primary,
      "::placeholder": {
        color: vars.colors.text.secondary,
      },
    }),

    listBox: style({
      flex: 1,
      overflow: "auto",
      overscrollBehavior: "contain",
    }),

    emptyState: style({
      padding: vars.spacing._6,
      textAlign: "center",
      color: vars.colors.text.secondary,
      fontSize: vars.typography.fontSizes.md,
    }),
  },

  SelectButton: {
    wrapper: style({
      display: "flex",
      alignItems: "center",
      gap: vars.spacing._2,
    }),

    button: style({
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
      height: `calc(${vars.spacing._9} + 1px)`,
      fontSize: vars.typography.fontSizes.md,
    }),

    placeholder: style({
      color: vars.colors.text.secondary,
      fontStyle: "italic",
    }),

    iconLink: style({
      flexShrink: 0,
      height: `calc(${vars.spacing._9} + 1px)`,
      aspectRatio: "1 / 1",
      background: vars.colors.button.default.base.background,
      color: vars.colors.button.default.base.text,
      borderColor: vars.colors.button.default.base.border,
      borderWidth: vars.borders.width.thin,
      borderStyle: "solid",
      borderRadius: vars.borders.radius.md,
      selectors: {
        "&:hover": {
          background: vars.colors.button.default.hover.background,
          color: vars.colors.button.default.hover.text,
          borderColor: vars.colors.button.default.hover.border,
        },
      },
    }),
  },
};

export const AnyFieldLabel = {
  dataType: style({
    fontFamily: vars.typography.fontFamilies.monospace,
    fontSize: vars.typography.fontSizes.sm,
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
    fontSize: vars.typography.fontSizes.md,
    marginInlineStart: vars.spacing._1,
  }),

  nonNullableAsterisk: style({
    color: vars.colors.reds._5,
  }),
};
