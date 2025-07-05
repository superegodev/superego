import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CollectionsTree = {
  root: style({
    display: "flex",
    flexDirection: "column",
    marginInline: `calc(-1 * ${vars.spacing._2})`,
    fontSize: vars.typography.fontSizes.sm,
  }),
};

export const Header = {
  root: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: vars.typography.fontSizes.xs,
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
    marginBlock: vars.spacing._05,
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
    paddingBlock: vars.spacing._1,
    lineHeight: vars.typography.lineHeights.normal,
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
    fontSize: vars.typography.fontSizes.md,
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
  submitButtonContainer: style({
    display: "flex",
    justifyContent: "flex-end",
  }),
};

export const CollectionTreeItem = {
  contentContainer: style({
    paddingBlock: vars.spacing._1,
    lineHeight: vars.typography.lineHeights.normal,
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
