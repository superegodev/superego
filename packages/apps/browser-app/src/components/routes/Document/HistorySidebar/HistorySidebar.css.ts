import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../../../themes.css.js";

export const HistorySidebar = {
  root: style({
    display: "flex",
    flexDirection: "column",
    width: vars.spacing._72,
    minWidth: vars.spacing._72,
    height: "100%",
    borderInlineStart: `${vars.borders.width.thin} solid ${vars.colors.border.subtle}`,
    background: vars.colors.background.secondarySurface,
    overflow: "hidden",
  }),

  header: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: vars.spacing._4,
    borderBlockEnd: `${vars.borders.width.thin} solid ${vars.colors.border.subtle}`,
  }),

  headerTitle: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._2,
    fontSize: vars.typography.fontSizes.md,
    fontWeight: vars.typography.fontWeights.medium,
  }),

  closeButton: style({
    padding: vars.spacing._1,
    fontSize: vars.typography.fontSizes.lg,
  }),

  content: style({
    flexGrow: 1,
    overflow: "auto",
    padding: vars.spacing._2,
  }),

  loading: style({
    display: "flex",
    justifyContent: "center",
    padding: vars.spacing._8,
  }),

  error: style({
    padding: vars.spacing._4,
    color: vars.colors.semantic.error.text,
  }),

  empty: style({
    padding: vars.spacing._4,
    color: vars.colors.text.secondary,
    textAlign: "center",
    fontSize: vars.typography.fontSizes.sm,
  }),
};

export const VersionBucket = {
  root: style({
    marginBlockEnd: vars.spacing._2,
  }),

  trigger: style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing._1,
    width: "100%",
    padding: `${vars.spacing._1} ${vars.spacing._2}`,
    fontSize: vars.typography.fontSizes.sm,
    fontWeight: vars.typography.fontWeights.medium,
    color: vars.colors.text.secondary,
    cursor: "pointer",
    borderRadius: vars.borders.radius.md,
    selectors: {
      "&:hover": {
        background: vars.colors.background.surfaceHighlight,
      },
    },
  }),

  triggerIcon: style({
    flexShrink: 0,
    fontSize: vars.typography.fontSizes.xs,
  }),

  panel: style({
    paddingInlineStart: vars.spacing._4,
  }),
};

const versionItemBase = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing._0_5,
  padding: `${vars.spacing._2} ${vars.spacing._2}`,
  borderRadius: vars.borders.radius.md,
  cursor: "pointer",
  fontSize: vars.typography.fontSizes.sm,
});

export const VersionItem = {
  root: styleVariants({
    default: [
      versionItemBase,
      {
        selectors: {
          "&:hover": {
            background: vars.colors.background.surfaceHighlight,
          },
        },
      },
    ],
    selected: [
      versionItemBase,
      {
        background: vars.colors.background.inverse,
        color: vars.colors.text.inverse,
      },
    ],
  }),

  header: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: vars.spacing._2,
  }),

  timestamp: style({
    fontWeight: vars.typography.fontWeights.medium,
  }),

  badge: style({
    fontSize: vars.typography.fontSizes.xs,
    padding: `${vars.spacing._0_5} ${vars.spacing._1}`,
    borderRadius: vars.borders.radius.sm,
    background: vars.colors.background.surfaceHighlight,
  }),

  currentBadge: style({
    fontSize: vars.typography.fontSizes.xs,
    padding: `${vars.spacing._0_5} ${vars.spacing._1}`,
    borderRadius: vars.borders.radius.sm,
    background: vars.colors.semantic.success.background,
    color: vars.colors.semantic.success.text,
  }),

  contentSummary: style({
    color: vars.colors.text.secondary,
    fontSize: vars.typography.fontSizes.xs,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
};

// Apply secondary color to content summary when item is selected
globalStyle(`${VersionItem.root.selected} ${VersionItem.contentSummary}`, {
  color: vars.colors.text.inverse,
  opacity: 0.7,
});

globalStyle(`${VersionItem.root.selected} ${VersionItem.badge}`, {
  background: "rgba(255, 255, 255, 0.2)",
  color: vars.colors.text.inverse,
});

export const RestoreVersionButton = {
  root: style({
    marginBlockStart: vars.spacing._4,
    paddingInline: vars.spacing._4,
  }),
};

export const RestoreVersionModalForm = {
  content: style({
    marginBlockEnd: vars.spacing._4,
  }),

  buttonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
    gap: vars.spacing._2,
  }),
};
