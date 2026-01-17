import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

// Used for both DocumentSearchResult and ConversationSearchResult.
export const SearchResult = {
  root: style({
    display: "block",
    padding: vars.spacing._4,
    textDecoration: "none",
    color: vars.colors.text.primary,
    cursor: "pointer",
    borderBlockStart: `${vars.borders.width.thin} solid ${vars.colors.border.default}`,
    selectors: {
      "&:first-child": {
        borderBlockStart: 0,
      },
      "&:hover": {
        background: vars.colors.background.surfaceHighlight,
      },
      "&:focus": {
        outline: "none",
        background: vars.colors.background.surfaceHighlight,
      },
    },
  }),

  line1: style({
    display: "flex",
    alignItems: "center",
    marginBlockEnd: vars.spacing._2,
  }),

  displayNameTitle: style({
    flex: 1,
    fontSize: vars.typography.fontSizes.md,
    fontWeight: vars.typography.fontWeights.medium,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  collectionChip: style({
    flexShrink: 0,
    padding: `${vars.spacing._0_25} ${vars.spacing._2}`,
    fontSize: vars.typography.fontSizes.xs,
    borderRadius: vars.borders.radius.md,
    background: vars.colors.background.inverse,
    color: vars.colors.text.inverse,
    whiteSpace: "nowrap",
  }),

  line2: style({
    fontSize: vars.typography.fontSizes.md,
    color: vars.colors.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginBlockEnd: vars.spacing._1,
  }),

  line3: style({
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.secondary,
    fontStyle: "italic",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
};
