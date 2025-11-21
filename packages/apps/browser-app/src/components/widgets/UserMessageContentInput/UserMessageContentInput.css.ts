import { style } from "@vanilla-extract/css";
import { dark, vars } from "../../../themes.css.js";

export const UserMessageContentInput = {
  root: style({
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    paddingInline: vars.spacing._2,
    paddingBlockStart: vars.spacing._2,
    paddingBlockEnd: vars.spacing._2,
    borderRadius: vars.borders.radius.xl,
    border: `${vars.borders.width.thin} solid ${vars.colors.border.subtle}`,
    boxShadow: `0 ${vars.spacing._0_5} ${vars.spacing._0_5} rgba(from ${vars.colors.border.focus} r g b / 0.1)`,
    selectors: {
      [`${dark} &`]: {
        boxShadow: "none",
        background: vars.colors.background.secondarySurface,
      },
    },
  }),

  textField: style({
    padding: vars.spacing._2,
  }),

  textArea: style({
    width: "100%",
    maxHeight: vars.spacing._80,
    fontFamily: vars.typography.fontFamilies.sansSerif,
    fontSize: vars.typography.fontSizes.sm,
    border: 0,
    background: vars.colors.background.surface,
    color: vars.colors.text.primary,
    height: 16.5,
    padding: 0,
    marginBlock: vars.spacing._0_5,
    resize: "none",
    selectors: {
      "&:disabled": {
        background: vars.colors.background.surface,
      },
      [`${dark} &, ${dark} &:disabled`]: {
        background: vars.colors.background.secondarySurface,
      },
      '&:focus-visible[data-focus-visible="true"]': {
        outline: "none",
      },
    },
  }),

  spinner: style({
    position: "absolute",
    // Manual pixel adjustment to center the buttons with the default
    // textarea height.
    top: `calc(${vars.spacing._4} + 1px)`,
    right: vars.spacing._4,
    width: vars.spacing._10,
    height: vars.spacing._4,
  }),

  actionsToolbar: style({
    display: "flex",
    justifyContent: "space-between",
  }),
};

export const FilesTray = {
  root: style({
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: vars.spacing._1,
    marginBlockEnd: vars.spacing._2,
  }),
};

export const TrayFile = {
  root: style({
    display: "flex",
    gap: vars.spacing._2,
    padding: vars.spacing._1,
    background: vars.colors.background.surfaceHighlight,
    borderRadius: vars.borders.radius.md,
    minWidth: 0,
  }),

  iconOrImageContainer: style({
    flexShrink: 0,
    height: vars.spacing._10,
    width: vars.spacing._10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: vars.typography.fontSizes.xl2,
  }),

  image: style({
    height: "100%",
    width: "100%",
    borderRadius: vars.borders.radius.md,
    objectFit: "cover",
  }),

  nameContainer: style({
    display: "flex",
    alignItems: "center",
    fontSize: vars.typography.fontSizes.sm,
    flexGrow: 1,
    minWidth: 0,
  }),

  nameTruncator: style({
    overflow: "hidden",
    textWrap: "nowrap",
    textOverflow: "ellipsis",
  }),

  removeButtonContainer: style({
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    marginInlineEnd: vars.spacing._1,
  }),

  removeButton: style({
    borderRadius: vars.borders.radius.full,
    fontSize: vars.typography.fontSizes.xs3,
    padding: 0,
  }),
};

const actionsToolbarButtonBase = style({
  padding: 0,
  height: vars.spacing._8,
  width: vars.spacing._8,
  borderRadius: vars.borders.radius.full,
  fontSize: vars.typography.fontSizes.lg,
});

export const AddFilesButton = {
  root: actionsToolbarButtonBase,
};

export const SendRecordButtons = {
  root: style({
    justifySelf: "end",
  }),

  button: actionsToolbarButtonBase,

  disabledLookingButton: style([
    actionsToolbarButtonBase,
    {
      color: vars.colors.button.invisible.disabled.text,
    },
  ]),
};
