import { breakpoints } from "../../themes.css.js";
import ScreenSize from "./ScreenSize.js";

export const smallScreenQuery = `(max-width: ${breakpoints.small})`;
export const mediumScreenQuery = `(max-width: ${breakpoints.medium})`;

export default function getScreenSize(): ScreenSize {
  return window.matchMedia(smallScreenQuery).matches
    ? ScreenSize.Small
    : window.matchMedia(mediumScreenQuery).matches
      ? ScreenSize.Medium
      : ScreenSize.Large;
}
