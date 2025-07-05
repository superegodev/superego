import { useEffect } from "react";
import applyTheme from "../../utils/applyTheme.js";
import useTheme from "./useTheme.js";

/** Applies the theme to the app. */
export default function useApplyTheme() {
  const theme = useTheme();
  useEffect(() => applyTheme(theme), [theme]);
}
