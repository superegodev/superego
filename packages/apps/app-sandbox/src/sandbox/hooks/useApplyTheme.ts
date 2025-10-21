import { Theme } from "@superego/backend";
import { useEffect } from "react";
import { dark, light } from "../themes.css.js";

export default function useApplyTheme(theme: Theme) {
  useEffect(() => {
    const isLight = theme === Theme.Light;
    document.body.classList.add(isLight ? light : dark);
    document.body.classList.remove(isLight ? dark : light);
  }, [theme]);
}
