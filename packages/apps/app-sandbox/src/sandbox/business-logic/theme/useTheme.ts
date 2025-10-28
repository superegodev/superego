import type { Theme } from "@superego/backend";
import useSettings from "../settings/useSettings.js";

export default function useTheme(): Theme.Light | Theme.Dark {
  const { theme } = useSettings();
  return theme;
}
