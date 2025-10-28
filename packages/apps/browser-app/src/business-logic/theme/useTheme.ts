import { Theme } from "@superego/backend";
import { useEffect, useState } from "react";
import { useGlobalData } from "../backend/GlobalData.js";

const prefersLightMediaQuery = "(prefers-color-scheme: light)";

export default function useTheme(): Exclude<Theme, typeof Theme.Auto> {
  const globalData = useGlobalData();
  const [theme, setTheme] = useState(
    resolveTheme(globalData.globalSettings.appearance.theme),
  );

  // Update theme when color scheme changes. (The user might have set their OS
  // to change theme based on time of day.)
  useEffect(() => {
    const prefersLight = window.matchMedia(prefersLightMediaQuery);
    const onPrefersLightChange = () =>
      setTheme(resolveTheme(globalData.globalSettings.appearance.theme));
    prefersLight.addEventListener("change", onPrefersLightChange);
    return () => {
      prefersLight.removeEventListener("change", onPrefersLightChange);
    };
  }, [globalData.globalSettings.appearance.theme]);

  return theme;
}

function resolveTheme(theme: Theme): Theme.Light | Theme.Dark {
  return theme === Theme.Auto
    ? window.matchMedia(prefersLightMediaQuery).matches
      ? Theme.Light
      : Theme.Dark
    : theme;
}
