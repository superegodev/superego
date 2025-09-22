import { Theme } from "@superego/backend";
import { useGlobalData } from "../backend/GlobalData.js";

export default function useTheme(): Exclude<Theme, typeof Theme.Auto> {
  const { theme } = useGlobalData().globalSettings.appearance;
  return theme === Theme.Auto
    ? window.matchMedia("(prefers-color-scheme: light)").matches
      ? Theme.Light
      : Theme.Dark
    : theme;
}
