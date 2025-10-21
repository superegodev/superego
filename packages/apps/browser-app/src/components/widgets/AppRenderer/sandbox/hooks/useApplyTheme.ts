import type { Theme } from "@superego/backend";
import { useEffect, useState } from "react";
import applyTheme from "../../../../../utils/applyTheme.js";
import resolveTheme from "../../../../../utils/resolveTheme.js";

// Copy of the BrowserApp useApplyTheme that allows using it without calling
// useGlobalData.
export default function useApplyTheme(settingsTheme: Theme) {
  const [theme, setTheme] = useState(resolveTheme(settingsTheme));

  // Update theme when color scheme changes. (The user might have set their OS
  // to change theme based on time of day.)
  useEffect(() => {
    const prefersLightMQL = window.matchMedia("(prefers-color-scheme: light)");
    const onPrefersLightMQLChange = () => setTheme(resolveTheme(settingsTheme));
    prefersLightMQL.addEventListener("change", onPrefersLightMQLChange);
    return () => {
      prefersLightMQL.removeEventListener("change", onPrefersLightMQLChange);
    };
  }, [settingsTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return theme;
}
