import { Theme } from "@superego/backend";
import { dark, light } from "../themes.css.js";

export default function applyTheme(theme: Theme) {
  const isLight =
    theme === Theme.Auto
      ? window.matchMedia("(prefers-color-scheme: light)").matches
      : theme === Theme.Light;
  document.body.classList.add(isLight ? light : dark);
  document.body.classList.remove(isLight ? dark : light);
}
