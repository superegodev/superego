import { Theme } from "@superego/backend";
import * as echarts from "echarts";
import { colors, vars } from "../../../themes.css.js";

const seriesColors = [
  colors.blues._4,
  colors.greens._4,
  colors.yellows._4,
  colors.reds._4,
  colors.cyans._4,
  colors.teals._4,
  colors.oranges._4,
  colors.violets._4,
  colors.pinks._4,
];

const CSS_VAR_REGEX = /^var\(\s*(--[^,\s)]+)\s*(?:,\s*(.+))?\)$/;

const resolveVar = (styles: CSSStyleDeclaration, value: string): string => {
  const trimmedValue = value.trim();
  const match = CSS_VAR_REGEX.exec(trimmedValue);
  if (!match) {
    return trimmedValue;
  }

  const [, variableName, fallback] = match;
  if (!variableName) {
    return trimmedValue;
  }

  const computedValue = styles.getPropertyValue(variableName)?.trim();

  if (computedValue) {
    return computedValue;
  }

  if (fallback) {
    return resolveVar(styles, fallback);
  }

  return trimmedValue;
};

const buildAxisOptions = (
  axisLineColor: string,
  axisLabelColor: string,
  splitLineColor: string,
  splitAreaColor: string,
) => ({
  axisLine: {
    lineStyle: {
      color: axisLineColor,
    },
  },
  axisTick: {
    lineStyle: {
      color: axisLineColor,
    },
  },
  axisLabel: {
    color: axisLabelColor,
  },
  splitLine: {
    lineStyle: {
      color: splitLineColor,
    },
  },
  splitArea: {
    areaStyle: {
      color: [splitAreaColor, "transparent"],
    },
  },
});

function buildTheme(
  theme: Theme.Light | Theme.Dark,
  styles: CSSStyleDeclaration,
) {
  const accentColor = resolveVar(styles, vars.colors.accent);
  const backgroundSurface = resolveVar(styles, vars.colors.background.surface);
  const backgroundSecondarySurface = resolveVar(
    styles,
    vars.colors.background.secondarySurface,
  );
  const backgroundSurfaceHighlight = resolveVar(
    styles,
    vars.colors.background.surfaceHighlight,
  );
  const backgroundInverse = resolveVar(styles, vars.colors.background.inverse);
  const borderDefault = resolveVar(styles, vars.colors.border.default);
  const borderSubtle = resolveVar(styles, vars.colors.border.subtle);
  const borderStrong = resolveVar(styles, vars.colors.border.strong);
  const borderFocus = resolveVar(styles, vars.colors.border.focus);
  const textPrimary = resolveVar(styles, vars.colors.text.primary);
  const textSecondary = resolveVar(styles, vars.colors.text.secondary);
  const textInverse = resolveVar(styles, vars.colors.text.inverse);

  const axisLineColor = borderDefault;
  const axisLabelColor = textSecondary;
  const splitLineColor = theme === Theme.Dark ? borderStrong : borderSubtle;
  const splitAreaColor =
    theme === Theme.Dark
      ? backgroundSurfaceHighlight
      : backgroundSecondarySurface;
  const tooltipBackgroundColor =
    theme === Theme.Dark ? backgroundSurfaceHighlight : backgroundInverse;
  const tooltipTextColor = theme === Theme.Dark ? textPrimary : textInverse;
  const tooltipBorderColor = theme === Theme.Dark ? borderStrong : borderFocus;
  const axisPointerLabelBackground = tooltipBackgroundColor;
  const axisPointerLabelColor = tooltipTextColor;
  const dataZoomFillerColor = backgroundSurfaceHighlight;
  const dataZoomBorderColor = borderDefault;
  const dataZoomHandleColor = borderFocus;
  const dataZoomHandleBorder = borderFocus;
  const dataBackgroundAreaColor = backgroundSurfaceHighlight;

  return {
    color: seriesColors,
    backgroundColor: backgroundSurface,
    textStyle: {
      color: textPrimary,
    },
    title: {
      textStyle: {
        color: textPrimary,
      },
      subtextStyle: {
        color: textSecondary,
      },
    },
    legend: {
      textStyle: {
        color: axisLabelColor,
      },
    },
    tooltip: {
      backgroundColor: tooltipBackgroundColor,
      borderColor: tooltipBorderColor,
      textStyle: {
        color: tooltipTextColor,
      },
    },
    axisPointer: {
      lineStyle: {
        color: accentColor,
      },
      crossStyle: {
        color: accentColor,
      },
      label: {
        color: axisPointerLabelColor,
        backgroundColor: axisPointerLabelBackground,
      },
    },
    categoryAxis: buildAxisOptions(
      axisLineColor,
      axisLabelColor,
      splitLineColor,
      splitAreaColor,
    ),
    valueAxis: buildAxisOptions(
      axisLineColor,
      axisLabelColor,
      splitLineColor,
      splitAreaColor,
    ),
    logAxis: buildAxisOptions(
      axisLineColor,
      axisLabelColor,
      splitLineColor,
      splitAreaColor,
    ),
    timeAxis: buildAxisOptions(
      axisLineColor,
      axisLabelColor,
      splitLineColor,
      splitAreaColor,
    ),
    toolbox: {
      iconStyle: {
        borderColor: borderFocus,
      },
    },
    dataZoom: {
      textStyle: {
        color: axisLabelColor,
      },
      fillerColor: dataZoomFillerColor,
      borderColor: dataZoomBorderColor,
      handleStyle: {
        color: dataZoomHandleColor,
        borderColor: dataZoomHandleBorder,
      },
      dataBackground: {
        lineStyle: {
          color: splitLineColor,
        },
        areaStyle: {
          color: dataBackgroundAreaColor,
        },
      },
    },
    visualMap: {
      textStyle: {
        color: axisLabelColor,
      },
    },
  };
}

const styles = getComputedStyle(document.body);

const LIGHT_THEME_NAME = "superego-light";
const DARK_THEME_NAME = "superego-dark";
echarts.registerTheme(LIGHT_THEME_NAME, buildTheme(Theme.Light, styles));
echarts.registerTheme(DARK_THEME_NAME, buildTheme(Theme.Dark, styles));

export default function getTheme(theme: Theme.Light | Theme.Dark): string {
  return theme === Theme.Dark ? DARK_THEME_NAME : LIGHT_THEME_NAME;
}
