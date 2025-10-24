import { Theme } from "@superego/backend";
import { useLayoutEffect } from "react";
import { dark, light } from "../../themes.css.js";

export default function useApplyTheme(
  theme: Theme.Light | Theme.Dark | undefined,
) {
  useLayoutEffect(() => {
    if (!theme) {
      document.body.classList.remove(light, dark);
    } else {
      const isLight = theme === Theme.Light;
      document.body.classList.add(isLight ? light : dark);
      document.body.classList.remove(isLight ? dark : light);
    }
  }, [theme]);
}
