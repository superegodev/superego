import { useContext } from "react";
import type ScreenSize from "./ScreenSize.js";
import ScreenSizeContext from "./ScreenSizeContext.js";

export default function useScreenSize(): ScreenSize {
  const screenSize = useContext(ScreenSizeContext);
  if (screenSize === null) {
    throw new Error(
      "You must be inside a ScreenSizeProvider to use this hook.",
    );
  }
  return screenSize;
}
