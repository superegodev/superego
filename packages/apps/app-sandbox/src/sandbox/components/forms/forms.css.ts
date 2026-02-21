import {
  type ComplexStyleRule,
  globalStyle,
  style,
  styleVariants,
} from "@vanilla-extract/css";
import { vars } from "../../themes.css.js";

const inputRootBase: ComplexStyleRule = {
  width: "100%",
  // Pixel adjustment so all inputs' heights match.
  height: `calc(${vars.spacing._9} + 1px)`,
  fontFamily: vars.typography.fontFamilies.sansSerif,
  fontSize: vars.typography.fontSizes.md,
  padding: vars.spacing._2,
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

const labelRootBase = style({
  display: "block",
  fontSize: vars.typography.fontSizes.md,
  fontWeight: vars.typography.fontWeights.medium,
  color: vars.colors.text.primary,
  selectors: {
    '[data-disabled="true"] > &': {
      color: vars.colors.text.secondary,
    },
  },
});

const verticalFieldRootBase: ComplexStyleRule = {
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing._2,
};

const horizontalFieldBase = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: vars.spacing._2,
  alignItems: "center",
});

globalStyle(`${horizontalFieldBase} > :not(${labelRootBase})`, {
  gridColumn: 2,
});

export const TextField = {
  root: styleVariants({
    vertical: verticalFieldRootBase,
    horizontal: [horizontalFieldBase],
  }),
};

export const NumberField = {
  root: styleVariants({
    vertical: verticalFieldRootBase,
    horizontal: [horizontalFieldBase],
  }),
};

export const RadioGroup = {
  root: styleVariants({
    vertical: { ...verticalFieldRootBase, color: vars.colors.text.primary },
    horizontal: [horizontalFieldBase, { color: vars.colors.text.primary }],
  }),
};

export const Radio = {
  root: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.md,
    selectors: {
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
    fontSize: vars.typography.fontSizes.sm,
  }),
};

export const Select = {
  root: styleVariants({
    vertical: verticalFieldRootBase,
    horizontal: [horizontalFieldBase],
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
    height: `calc(${vars.spacing._9} + 1px)`,
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

  clearButton: style({
    display: "flex",
    alignItems: "center",
    height: vars.spacing._9,
    marginBlock: `calc(-1 * ${vars.spacing._2})`,
    border: 0,
    cursor: "pointer",
    background: "transparent",
    color: vars.colors.text.secondary,
    selectors: {
      "&:hover": {
        color: vars.colors.text.primary,
      },
    },
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
    border: `${vars.borders.width.thin} solid transparent`,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSizes.md,
    selectors: {
      "&:not(:last-child)": {
        marginBlockEnd: vars.spacing._1,
      },
      '&[data-selected="true"]': {
        fontWeight: vars.typography.fontWeights.medium,
        borderColor: vars.colors.border.strong,
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
    fontSize: vars.typography.fontSizes.sm,
    textAlign: "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textWrap: "nowrap",
  }),
};

export const Label = {
  root: labelRootBase,
};

export const Description = {
  root: style({
    fontSize: vars.typography.fontSizes.sm,
    fontStyle: "italic",
    selectors: {
      '[data-disabled="true"] > &': {
        color: vars.colors.text.secondary,
      },
    },
  }),
};

export const DatePicker = {
  root: styleVariants({
    vertical: verticalFieldRootBase,
    horizontal: [horizontalFieldBase],
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
    alignItems: "center",
    alignSelf: "center",
    width: "fit-content",
    whiteSpace: "nowrap",
    forcedColorAdjust: "none",
    flexGrow: 1,
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

  clearButton: style({
    display: "flex",
    alignItems: "center",
    height: vars.spacing._9,
    marginBlock: `calc(-1 * ${vars.spacing._2})`,
    border: 0,
    cursor: "pointer",
    background: "transparent",
    color: vars.colors.text.secondary,
    selectors: {
      "&:hover": {
        color: vars.colors.text.primary,
      },
    },
  }),

  button: style({
    display: "flex",
    alignItems: "center",
    height: vars.spacing._9,
    marginBlock: `calc(-1 * ${vars.spacing._2})`,
    border: 0,
    cursor: "pointer",
    background: "transparent",
  }),
};

export const DateRangePicker = {
  root: styleVariants({
    vertical: verticalFieldRootBase,
    horizontal: [horizontalFieldBase],
  }),
};

export const DateRangePickerInput = {
  root: style([
    inputRootBase,
    {
      display: "flex",
    },
  ]),

  dateFields: style({
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
  }),

  dateInput: style({
    border: 0,
    alignItems: "center",
    alignSelf: "center",
    width: "fit-content",
    whiteSpace: "nowrap",
    forcedColorAdjust: "none",
  }),

  separator: style({
    paddingInline: vars.spacing._1,
    color: vars.colors.text.secondary,
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

  clearButton: style({
    display: "flex",
    alignItems: "center",
    height: vars.spacing._9,
    marginBlock: `calc(-1 * ${vars.spacing._2})`,
    border: 0,
    cursor: "pointer",
    background: "transparent",
    color: vars.colors.text.secondary,
    selectors: {
      "&:hover": {
        color: vars.colors.text.primary,
      },
    },
  }),

  button: style({
    display: "flex",
    alignItems: "center",
    height: vars.spacing._9,
    marginBlock: `calc(-1 * ${vars.spacing._2})`,
    border: 0,
    cursor: "pointer",
    background: "transparent",
  }),
};

export const DateRangePickerCalendar = {
  previousNextButton: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: `calc(${vars.spacing._9} + 1px)`,
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
    fontSize: vars.typography.fontSizes.lg,
  }),

  headerCell: style({
    paddingBlock: vars.spacing._3,
    fontSize: vars.typography.fontSizes.sm,
  }),

  cell: style({
    width: vars.spacing._9,
    height: vars.spacing._9,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: vars.spacing._0_5,
    fontSize: vars.typography.fontSizes.md,
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
      '&[data-selection-start="true"]': {
        fontWeight: vars.typography.fontWeights.bold,
        background: vars.colors.accent,
        color: vars.colors.text.onAccent,
      },
      '&[data-selection-end="true"]': {
        fontWeight: vars.typography.fontWeights.bold,
        background: vars.colors.accent,
        color: vars.colors.text.onAccent,
      },
    },
  }),
};

export const DatePickerCalendar = {
  previousNextButton: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: `calc(${vars.spacing._9} + 1px)`,
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
    fontSize: vars.typography.fontSizes.lg,
  }),

  headerCell: style({
    paddingBlock: vars.spacing._3,
    fontSize: vars.typography.fontSizes.sm,
  }),

  cell: style({
    width: vars.spacing._9,
    height: vars.spacing._9,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: vars.spacing._0_5,
    fontSize: vars.typography.fontSizes.md,
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
