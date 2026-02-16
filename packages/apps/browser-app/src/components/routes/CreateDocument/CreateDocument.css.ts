import { style } from "@vanilla-extract/css";
import { vars } from "../../../themes.css.js";

export const CreateDocumentForm = {
  root: style({
    vars: {
      // Height of the visible area in which RHFContentField is rendered. Can be
      // used to define "sticky" custom layouts.
      "--visible-area-height": `
        calc(
          100dvh - (
            ${vars.shell.panelHeaderHeight}
            + ${vars.spacing._4}
            + ${vars.spacing._8}
          )
        )
      `,
      // Distance from the top of the visible area.
      "--visible-area-top": `
        calc(
          ${vars.shell.panelHeaderHeight}
          + ${vars.spacing._4}
        )
      `,
      // Standard vertical gap to use between sections.
      "--section-vertical-gap": vars.spacing._8,
      // Standard horizontal gap to use between sections.
      "--section-horizontal-gap": vars.spacing._8,
      // Standard vertical gap to use between fields.
      "--field-vertical-gap": vars.spacing._6,
      // Standard horizontal gap to use between fields.
      "--field-horizontal-gap": vars.spacing._2,
    },
  }),
};

export const DuplicateDocumentDetectedModal = {
  duplicateDocument: style({
    display: "flex",
    justifyContent: "center",
    marginBlock: vars.spacing._10,
  }),
};
