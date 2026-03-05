import {
  type ComplexStyleRule,
  globalStyle,
  style,
} from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

const selectTriggerBase: ComplexStyleRule = {
  height: vars.spacing._6,
  lineHeight: vars.spacing._6,
  alignItems: "center",
  gap: vars.spacing._1,
  fontSize: vars.typography.fontSizes.sm,
  paddingInline: vars.spacing._2,
  border: 0,
  borderRadius: vars.borders.radius.full,
  selectors: {
    "&:hover": {
      background: vars.colors.background.surfaceHighlight,
    },
    "&:disabled": {
      cursor: "not-allowed",
      background: vars.colors.background.surface,
    },
  },
};

export const ModelSelect = {
  trigger: style(selectTriggerBase),
};

export const ReasoningEffortSelect = {
  trigger: style(selectTriggerBase),
};

// Hide dash and description in the SelectButton.
globalStyle(`${ModelSelect.trigger} > span:first-child > *`, {
  display: "none",
});
globalStyle(`${ModelSelect.trigger} > span:first-child > div:first-child`, {
  display: "block",
});
globalStyle(`${ReasoningEffortSelect.trigger} > span:first-child > *`, {
  display: "none",
});
globalStyle(
  `${ReasoningEffortSelect.trigger} > span:first-child > div:first-child`,
  {
    display: "block",
  },
);
