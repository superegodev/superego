import { type ComplexStyleRule, style } from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

const inputRootBase: ComplexStyleRule = {
  width: "100%",
  fontFamily: vars.typography.fontFamilies.sansSerif,
  fontSize: vars.typography.fontSizes.sm,
  padding: vars.spacing._2,
  marginBlockEnd: vars.spacing._2,
  borderWidth: vars.borders.width.thin,
  borderRadius: vars.borders.radius.md,
  borderStyle: "solid",
  borderColor: vars.colors.border.default,
  background: vars.colors.background.surface,
  color: vars.colors.text.primary,
  selectors: {
    '[data-invalid="true"] &': {
      borderColor: vars.colors.semantic.error.border,
    },
    '&[data-disabled="true"]': {
      color: vars.colors.text.secondary,
    },
    "&::placeholder": {
      fontStyle: "italic",
    },
  },
};

export const TextField = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),
};

export const NumberField = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),
};

export const RadioGroup = {
  root: style({
    display: "flex",
    flexDirection: "column",
    color: vars.colors.text.primary,
  }),
};

export const Radio = {
  root: style({
    display: "flex",
    alignItems: "flex-start",
    gap: vars.spacing._2,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
    selectors: {
      "&:not(:last-child)": {
        marginBlockEnd: vars.spacing._2,
      },
      "&::before": {
        content: "''",
        display: "block",
        width: vars.spacing._4,
        height: vars.spacing._4,
        boxSizing: "border-box",
        border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
        background: vars.colors.background.surface,
        borderRadius: vars.borders.radius.full,
        transition: "border-width 200ms",
      },
      '&[data-pressed="true"]::before': {
        borderColor: vars.colors.text.primary,
      },
      '&[data-selected="true"]::before': {
        borderColor: vars.colors.text.primary,
        borderWidth: `calc(2 * ${vars.borders.width.thick})`,
      },
      '&[data-selected="true"][data-pressed="true"]::before': {
        borderColor: vars.colors.text.primary,
      },
      '&[data-focus-visible="true"]::before': {
        borderColor: vars.colors.accent,
        outline: `2px solid ${vars.colors.accent}`,
        outlineOffset: "-2px",
      },
      '&[data-disabled="true"]': {
        color: vars.colors.text.secondary,
      },
      '&[data-disabled="true"]::before': {
        borderColor: vars.colors.border.default,
      },
    },
  }),

  label: style({
    lineHeight: 1.4,
  }),

  description: style({
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
  }),
};

export const Select = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),
};

export const Input = {
  root: style(inputRootBase),
};

export const SelectButton = {
  root: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin})`,
    marginBlockEnd: vars.spacing._2,
  }),

  selectValue: style({
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  }),

  placeholder: style({
    color: vars.colors.text.secondary,
    fontStyle: "italic",
  }),
};

export const SelectOptions = {
  root: style({
    width: "var(--trigger-width)",
    overflow: "auto",
  }),

  option: style({
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    padding: vars.spacing._2,
    cursor: "default",
    borderRadius: vars.borders.radius.md,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.sm,
    selectors: {
      "&:not(:last-child)": {
        marginBlockEnd: vars.spacing._1,
      },
      '&[data-selected="true"]': {
        fontWeight: vars.typography.fontWeights.medium,
        border: `${vars.borders.width.thin} solid ${vars.colors.border.strong}`,
      },
      '&:hover:not([data-disabled="true"])': {
        background: vars.colors.background.surfaceHighlight,
      },
      '&[data-disabled="true"]': {
        color: vars.colors.text.secondary,
        cursor: "not-allowed",
      },
    },
  }),

  optionValue: style({
    overflow: "hidden",
    textOverflow: "ellipsis",
    textWrap: "nowrap",
    flexShrink: 0,
  }),

  optionDescription: style({
    flexGrow: 1,
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
    textAlign: "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textWrap: "nowrap",
  }),
};

export const Label = {
  root: style({
    display: "block",
    marginBlockEnd: vars.spacing._2,
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.medium,
    color: vars.colors.text.primary,
    selectors: {
      '[data-disabled="true"] > &': {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

export const Description = {
  root: style({
    fontSize: vars.typography.fontSizes.xs,
    fontStyle: "italic",
    selectors: {
      '[data-disabled="true"] > &': {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

export const DatePicker = {
  root: style({
    display: "flex",
    flexDirection: "column",
  }),
};

export const DatePickerInput = {
  root: style([
    inputRootBase,
    {
      display: "flex",
    },
  ]),

  dateInput: style({
    border: 0,
    marginBlockEnd: 0,
    alignItems: "center",
    alignSelf: "center",
    width: "fit-content",
    whiteSpace: "nowrap",
    forcedColorAdjust: "none",
  }),

  dateSegment: style({
    paddingInline: vars.spacing._0_5,
    selectors: {
      "&:focus": {
        borderRadius: vars.borders.radius.sm,
        background: vars.colors.accent,
        color: vars.colors.text.onAccent,
        outlineOffset: 0,
      },
    },
  }),

  button: style({
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    height: vars.spacing._8,
    flexGrow: 1,
    marginBlock: `calc(-1 * ${vars.spacing._2})`,
    border: 0,
    cursor: "pointer",
    background: "transparent",
  }),
};

export const DatePickerCalendar = {
  previousNextButton: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin})`,
    marginBlockEnd: 0,
    border: 0,
    cursor: "pointer",
  }),

  header: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),

  heading: style({
    flexGrow: 1,
    margin: 0,
    textAlign: "center",
    fontSize: vars.typography.fontSizes.md,
  }),

  headerCell: style({
    paddingBlock: vars.spacing._3,
    fontSize: vars.typography.fontSizes.xs,
  }),

  cell: style({
    width: vars.spacing._8,
    height: vars.spacing._8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: vars.spacing._0_5,
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.primary,
    borderRadius: vars.borders.radius.md,
    cursor: "pointer",
    selectors: {
      '&[data-is-today="true"]': {
        border: `${vars.borders.width.medium} solid ${vars.colors.accent}`,
      },
      '&[data-outside-month="true"]': {
        color: vars.colors.text.secondary,
        pointerEvents: "none",
      },
      '&[data-hovered="true"]': {
        backgroundColor: vars.colors.background.surfaceHighlight,
      },
      '&[data-selected="true"]': {
        fontWeight: vars.typography.fontWeights.bold,
        border: `${vars.borders.width.thin} solid ${vars.colors.border.strong}`,
      },
    },
  }),
};
