import { Theme } from "@superego/backend";

export default function resolveTheme(theme: Theme): Theme.Light | Theme.Dark {
  return theme === Theme.Auto
    ? window.matchMedia("(prefers-color-scheme: light)").matches
      ? Theme.Light
      : Theme.Dark
    : theme;
}
