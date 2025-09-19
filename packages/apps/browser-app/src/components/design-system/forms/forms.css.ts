import { type ComplexStyleRule, style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const TextField = {
  root: style({
    display: "flex",
    flexDirection: "column",
    marginBlockEnd: vars.spacing._6,
  }),
};

export const NumberField = {
  root: style({
    display: "flex",
    flexDirection: "column",
    marginBlockEnd: vars.spacing._6,
  }),
};

export const RadioGroup = {
  root: style({
    display: "flex",
    flexDirection: "column",
    color: vars.colors.text.primary,
    marginBlockEnd: vars.spacing._6,
  }),
};

export const Radio = {
  root: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
    color: "var(--text-color)",
    fontSize: vars.typography.fontSizes.sm,
    marginBlockEnd: vars.spacing._2,
    selectors: {
      "&:first-of-type": {
        marginBlockStart: vars.spacing._1,
      },
      "&::before": {
        content: "''",
        display: "block",
        width: vars.spacing._4,
        height: vars.spacing._4,
        boxSizing: "border-box",
        border: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
        background: "var(--field-background)",
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
    },
  }),
};

export const Select = {
  root: style({
    display: "flex",
    flexDirection: "column",
    marginBlockEnd: vars.spacing._6,
  }),
};

export const SelectButton = {
  root: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: `calc(${vars.spacing._8} + 2 * ${vars.borders.width.thin})`,
    marginBlockEnd: vars.spacing._2,
  }),

  placeholder: style({
    color: vars.colors.text.secondary,
    fontStyle: "italic",
  }),
};

export const SelectOptions = {
  root: style({
    width: "var(--trigger-width)",
    overflow: "scroll",
  }),

  option: style({
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
      '&[data-selected="true"]::after': {
        content: "'✓'",
        float: "right",
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

  optionDescription: style({
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
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

export const inputComponentRootBase: ComplexStyleRule = {
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

export const Input = {
  root: style(inputComponentRootBase),
};

export const TextArea = {
  root: style([
    inputComponentRootBase,
    {
      // Experimental property:
      // https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
      //
      // Used even if not supported by all browsers since it just enhances the
      // experience, which still works well without it.
      ["fieldSizing" as any]: "content",
      resize: "vertical",
      flexGrow: "1",
    },
  ]),
};

export const FieldError = {
  root: style({
    display: "block",
    marginBlockEnd: vars.spacing._2,
    fontSize: vars.typography.fontSizes.xs,
    color: vars.colors.semantic.error.text,
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
    marginBlockEnd: vars.spacing._6,
  }),
};

export const DatePickerInput = {
  root: style([
    inputComponentRootBase,
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
