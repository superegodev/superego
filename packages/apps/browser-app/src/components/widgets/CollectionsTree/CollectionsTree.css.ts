import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CollectionsTree = {
  root: style({
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    marginInline: `calc(-1 * ${vars.spacing._2})`,
    fontSize: vars.typography.fontSizes.md,
  }),

  tree: style({
    flex: "0 1 auto",
    minHeight: 0,
    overflow: "auto",
    overscrollBehavior: "contain",
  }),

  emptyTree: style({
    display: "flex",
    gap: vars.spacing._2,
    alignItems: "center",
    width: "100%",
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.secondary,
  }),

  emptyTreeText: style({
    // Pixel-specific width to line up the arrow with the toolbar button.
    width: "172.5px",
    paddingInlineStart: vars.spacing._2,
  }),

  emptyTreeIcon: style({
    fontSize: vars.typography.fontSizes.lg,
    marginBlockEnd: vars.spacing._2,
  }),
};

export const Header = {
  root: style({
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: vars.typography.fontSizes.sm,
    color: vars.colors.text.secondary,
    marginInline: vars.spacing._2,
    marginBlockEnd: vars.spacing._2,
  }),
  toolbar: style({
    opacity: 0,
    selectors: {
      "div:hover > &, &:has(:focus)": {
        opacity: 1,
      },
    },
  }),
  toolbarAction: style({
    fontSize: vars.typography.fontSizes.lg,
    color: vars.colors.text.secondary,
  }),
};

export const RootTreeItem = {
  root: style({
    minHeight: vars.spacing._7,
    flexGrow: "1",
    borderRadius: vars.borders.radius.md,
  }),
};

export const TreeItem = {
  root: style({
    paddingInlineStart: `calc(${vars.spacing._2} + (var(--tree-item-level) - 1) * ${vars.spacing._7})`,
    paddingInlineEnd: vars.spacing._2,
    marginBlock: vars.spacing._0_5,
    borderRadius: vars.borders.radius.md,
    cursor: "pointer",
    selectors: {
      "&:hover": {
        background: vars.colors.background.surfaceHighlight,
      },
      '&:has(button[aria-haspopup="true"][aria-expanded="true"])': {
        background: vars.colors.background.surfaceHighlight,
      },
    },
  }),
  active: style({
    background: vars.colors.background.surfaceHighlight,
  }),
  dragging: style({
    opacity: 0.5,
  }),
  dropping: style({
    background: vars.colors.background.surfaceHighlight,
  }),
};

export const CollectionCategoryTreeItem = {
  contentContainer: style({
    position: "relative",
    paddingBlock: vars.spacing._1_5,
    lineHeight: vars.typography.lineHeights.tight,
  }),
  expandButton: style({
    background: "none",
    position: "relative",
    // Pixel position adjustment to align the chevron with the text
    top: 2,
    border: 0,
    padding: 0,
    paddingInlineEnd: vars.spacing._1,
    cursor: "pointer",
    color: vars.colors.text.primary,
  }),
};

export const CollectionCategoryActionsMenu = {
  trigger: style({
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    right: 0,
    fontSize: vars.typography.fontSizes.lg,
    opacity: 0,
    selectors: {
      [`
        ${CollectionCategoryTreeItem.contentContainer}:hover &,
        &:focus,
        &[aria-haspopup="true"][aria-expanded="true"]
      `]: {
        opacity: 1,
      },
    },
  }),
};

export const RenameCollectionCategoryModalForm = {
  inputs: style({
    display: "flex",
    columnGap: vars.spacing._2,
  }),
  nameInput: style({
    flexGrow: 1,
  }),
};

export const CollectionTreeItem = {
  contentContainer: style({
    paddingBlock: vars.spacing._1_5,
    lineHeight: vars.typography.lineHeights.tight,
  }),
};

export const TreeItemDragPreview = {
  root: style({
    paddingInline: vars.spacing._3,
    paddingBlock: vars.spacing._1,
    borderRadius: vars.borders.radius.full,
    background: vars.colors.background.inverse,
    color: vars.colors.text.inverse,
  }),
};
